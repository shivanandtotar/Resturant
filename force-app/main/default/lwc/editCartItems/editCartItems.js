import { LightningElement, wire, track, api } from 'lwc';
import getProducts from '@salesforce/apex/CartHandler.getProducts';
import placeOrder from '@salesforce/apex/CartHandler.placeOrder';
import getOrderDetails from '@salesforce/apex/CartHandler.getOrderDetails';

export default class EditCartItems extends LightningElement {
    @track products = [];
    openModal = false;
    totalAmount = 0;
    @api recordId;
    @track selectedProducts = [];
    @track wiredOrderList = [];
    isOrderEditable = true;
    @track orderItems = []

    // @wire(getOrderDetails) orderDetails(result) {
    //     this.wiredOrderList = result;
    //     if (result.data) {
    //         console.log('line12 ', result);
    //     } else if (result.error) {
    //         this.error = result.error;
    //     }
    // }
    handleModalBox() {
        this.openModal = !this.openModal;
        if (this.openModal) {
            this.selectedProducts = [];
            getOrderDetails({ 'orderId': this.recordId }).then(result => {
                console.log('line12 ', result);
                this.isOrderEditable = result.Status != 'Draft' && result.Status != 'Pending' ? false : true;
                this.orderNumber = result.orderNumber;
                this.orderStatus = result.Status;
                console.log('line33 ', result.comment)
                this.ifOrderRejected = result.comment?.length != undefined && result.comment?.length != 0 && result.comment?.length != null;
                this.orderRejectedComment = result.comment;
                result.items.map(item => {
                    this.totalAmount = this.totalAmount + Number(item.TotalPrice);
                    let obj = {
                        'name': item.Product2.Name,
                        'Id': item.Id,
                        'qunatity': item.Quantity,
                        'unitPrice': item.UnitPrice
                    }
                    this.orderItems.push(obj);
                })
                if (!this.isOrderEditable) return null;
                //changes to update cart even in pending order
                if (result.items.length != undefined && result.items.length > 0) {
                    result.items.map((item, index) => {
                        let prod = {
                            'key': index,
                            'Id': item.Id,
                            'Name': item.Product2.Name,
                            'UnitPrice': item.UnitPrice,
                            'quantity': item.Quantity,
                            'Product2Id': item.Product2Id,
                            'PricebookEntryId': item.PricebookEntryId
                        };
                        this.selectedProducts.push(prod);
                    })
                }
                getProducts()
                    .then(result => {
                        console.log('line13', result)
                        result.map((item, index) => {
                            let newItem = { ...item, 'key': index };
                            this.products.push(newItem);
                        })
                        // this.products = result;
                    })
                    .catch(error => {
                        this.error = error;
                    });
            }).catch(error => console.error(error))
            // getProducts()
            //     .then(result => {
            //         console.log('line12 ', result)
            //         this.products = result;
            //     })
            //     .catch(error => {
            //         this.error = error;
            //     });
        }
    }

    handleOrder() {
        this.openModal = !this.openModal;
        console.log(this.selectedProducts);
        console.log('orderID ', this.recordId);
        let orderItemRecords = [];
        this.selectedProducts.forEach(item => {
            let obj = {
                "OrderId": this.recordId,
                "Quantity": item.quantity,
                "Product2Id": item.Product2Id,
                "UnitPrice": item.UnitPrice,
                "PricebookEntryId": item.PricebookEntryId == undefined ? item.Id : item.PricebookEntryId,

            };
            orderItemRecords.push(obj);
        })
        let deletePreviousItems = this.orderStatus == 'Pending';
        console.log('line101 ', JSON.stringify(orderItemRecords))
        placeOrder({ 'orderItems': orderItemRecords, 'orderId': this.recordId, 'deletePreviousItems': deletePreviousItems })
            .then((result) => {
                console.log('calss result ', result);
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
            });
    }

    get placeOrderBtn() {
        return this.selectedProducts.length == 0
    }

    handleAddProduct(event) {
        let [product] = this.products.filter((item) => item.Product2Id == event.target.name);
        let prodAlreadyExists = this.selectedProducts.findIndex(item => item.Name == product.Name)
        let updatedProd = {};
        if (prodAlreadyExists == -1) {
            updatedProd = { ...product, "quantity": 1 };
            this.selectedProducts.push(updatedProd)
        } else {
            // updatedProd = this.selectedProducts[prodAlreadyExists];
            // updatedProd.quantity = updatedProd.quantity + 1;
            this.selectedProducts[prodAlreadyExists].quantity += 1;
        }
        console.log('line17 ', updatedProd)
        let tempProducts = this.products.filter((item) => item.Product2Id != event.target.name)
        this.products = [...tempProducts];
        this.calculateTotal();
    }

    handleRemoveProduct(event) {
        let [product] = this.selectedProducts.filter((item) => item.Product2Id == event.target.name);
        let prodAlreadyExists = this.products.findIndex(item => item.Name == product.Name);
        if (prodAlreadyExists == -1) {
            this.products.push(product)
        }
        let tempProducts = this.selectedProducts.filter((item) => item.Product2Id != event.target.name);
        this.selectedProducts = [...tempProducts];
        this.calculateTotal();
    }

    handleSubCount(event) {
        this.selectedProducts.forEach(item => {
            if (item.Product2Id == event.target.name) {
                if (item.quantity - 1 == 0) this.popProduct(item.Product2Id)
                else item.quantity = item.quantity - 1;
            }
        })
        this.calculateTotal();
    }

    popProduct(Product2Id) {
        let [product] = this.selectedProducts.filter((item) => item.Product2Id == Product2Id);
        let prodAlreadyExists = this.products.findIndex(item => item.Name == product.Name);
        if (prodAlreadyExists == -1) {
            this.products.push(product)
        }
        let tempProducts = this.selectedProducts.filter((item) => item.Product2Id != Product2Id);
        this.selectedProducts = [...tempProducts];
        this.calculateTotal();
    }

    handleAddCount(event) {
        this.selectedProducts.forEach(item => {
            if (item.Product2Id == event.target.name) {
                item.quantity = item.quantity + 1;
            }
        })
        this.calculateTotal();
    }

    calculateTotal() {
        this.totalAmount = 0;
        this.selectedProducts.forEach(item => {
            this.totalAmount = this.totalAmount + (item.quantity * Number(item.UnitPrice))
        });
    }
}