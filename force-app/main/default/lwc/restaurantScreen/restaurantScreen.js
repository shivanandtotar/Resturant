import { LightningElement, track, wire } from 'lwc';
import getPendingOrders from '@salesforce/apex/HandleRestroPanel.getPendingOrders';
import rejectOrder from '@salesforce/apex/HandleRestroPanel.rejectOrder';
import acceptOrder from '@salesforce/apex/HandleRestroPanel.acceptOrder';
import delieverOrder from '@salesforce/apex/HandleRestroPanel.delieverOrder';
import { refreshApex } from '@salesforce/apex';


export default class RestaurantScreen extends LightningElement {
    @track nonPendingOrders = [];
    @track pendingOrders = [];
    @track wiredOrderList = [];
    openRejectModal = false;
    comment = '';
    rejectOrderId

    openRejectPopup(event) {
        this.rejectOrderId = event.target.name;
        this.openRejectModal = !this.openRejectModal;
    }

    handleCommentChange(event) {
        this.comment = event.target.value;
    }

    get checkComment() {
        return this.comment.length == 0;
    }

    @wire(getPendingOrders) orderList(result) {
        this.wiredOrderList = result;
        if (result.data) {
            console.log('line12 ', result);
            this.pendingOrders = [];
            result.data.map(item => {
                if (item.Status == 'Pending') {
                    this.pendingOrders.push(item);
                } else {
                    let newItem = {
                        ...item,
                        'disabled': item.Status == 'Delivered' ? true : false,
                        'statuBtn': item.Status == 'Accepted' ? 'Ready to Pick' : (item.Status == 'Ready to Pick' ? 'Delivered' : 'Delivered')
                    }
                    this.nonPendingOrders.push(newItem);
                }
            });
            console.log('line18 ', this.pendingOrders)
            console.log('line18 ', this.nonPendingOrders)

        } else if (result.error) {
            this.error = result.error;
        }
    }

    handleAcceptOrder(event) {
        console.log('accept ', event.target.name);
        acceptOrder({ 'orderId': event.target.name })
            .then((result) => {
                console.log('accept result ', result);
                this.pendingOrders = this.nonPendingOrders = [];
                refreshApex(this.wiredOrderList);
            })
            .catch((error) => {
                this.error = error;
            });
    }
    handleRejectOrder() {
        rejectOrder({ 'orderId': this.rejectOrderId, 'comment': this.comment })
            .then((result) => {
                console.log('reject result ', result);
                this.openRejectModal = !this.openRejectModal;
                this.pendingOrders = this.nonPendingOrders = [];
                refreshApex(this.wiredOrderList);
            })
            .catch((error) => {
                this.error = error;
            });

    }
    handleNonPendingOrder(event) {
        console.log('deliver ', event.target.name);
        delieverOrder({ 'orderId': event.target.name, 'status': event.target.label })
            .then((result) => {
                console.log('deliver result ', result);
                this.pendingOrders = this.nonPendingOrders = [];
                refreshApex(this.wiredOrderList);
            })
            .catch((error) => {
                this.error = error;
            });
    }
}