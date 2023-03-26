@isTest
public class OrderManagementTest {
    @isTest static void orderFlowTest() {
               
        Pricebook2 pb = new Pricebook2(Name = 'Standard Food Menu', Description = 'Standard Food Menu', IsActive = true );
        insert pb;
        Product2 prod = new Product2(Name = 'Dosa', IsActive = true);
        insert prod;
        PricebookEntry pbe=new PricebookEntry(unitprice=0.01,Product2Id=prod.Id, Pricebook2Id=Test.getStandardPricebookId(), IsActive= true); 
        insert pbe;
        
        Test.startTest();
        String name = 'test Account1';
        Id orderId = CreateAccountOrder.createRecord(name);
        //CartHandler -> getProducts
        List<PricebookEntry> items = CartHandler.getProducts();
        //placeOrder
        List<OrderItem> orderItems = new List<OrderItem>();
        for(PricebookEntry item : items){
            OrderItem oitem = new OrderItem();
            oitem.OrderId= orderId;
            oitem.Quantity= 1;
            oitem.Product2Id= item.Product2Id;
            oitem.UnitPrice= item.UnitPrice;
            oitem.PricebookEntryId= item.Id;
            orderItems.add(oitem);
        }
        insert orderItems;
        Id updatedOrderId = CartHandler.placeOrder(orderItems, orderId,false); // order placed in pendingState
        //for exception = placeOrder
        Id resultexption = CartHandler.placeOrder(orderItems, 'fefff',false);
        //getOrderDetails
        Map<String, Object> orderDetails = CartHandler.getOrderDetails(orderId);
        
        //HandleRestroPanel
        //now order is in pending state
        List<Object> pendingOrder = HandleRestroPanel.getPendingOrders();
        
        //accept the order
        HandleRestroPanel.acceptOrder(orderId);
        //make ready to pick and deliver both are same method
        HandleRestroPanel.delieverOrder(orderId, 'Ready to Pick');
        
        Order orderData = [select Id, Status from Order where Id=: orderId];
        orderData.Status = 'Pending';
        update orderData;
        
        //will reject the order
        HandleRestroPanel.rejectOrder(orderId, 'Rejecting order with comment');
        
        Test.stopTest();

	}
    
}