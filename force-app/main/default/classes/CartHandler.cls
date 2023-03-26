public class CartHandler {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getOrderDetails(String orderId){
        Order orderDetail =  [select Status,OrderNumber, Comment__c from order where id=: orderId];
        Map<String, Object> returnDetail = new Map<String, Object>();
        returnDetail.put('Status',orderDetail.Status);
        returnDetail.put('orderNumber',orderDetail.OrderNumber);
        returnDetail.put('comment',orderDetail.Comment__c);
        List<OrderItem> items = [select Id,Product2.Name,TotalPrice  ,Quantity, UnitPrice,Product2Id,PricebookEntryId   from OrderItem where orderId=: orderId];
        returnDetail.put('items',items);
        return returnDetail;
    }

    @AuraEnabled(cacheable=true)
    public static List<sObject> getProducts(){
        return [select Id, Product2Id, UnitPrice, Name from PricebookEntry where  Pricebook2.Name='Standard Food Menu'];
    }

    @AuraEnabled
    public static Id placeOrder(List<OrderItem> orderItems, String orderId, Boolean deletePreviousItems){
        Id newOrderId;

        if(deletePreviousItems){
            //delete order items
            List<orderItem> lineItems = [select id from orderItem where orderId =: orderId];
            delete lineItems;
        }

        try{
            upsert orderItems;
            // insert orderItems;
            system.debug('line12 '+ orderId);
            Order orderDetail = [select Id, Status from Order where id =: orderId limit 1];
            orderDetail.Status = 'Pending';
            update orderDetail;
            newOrderId = orderDetail.Id;
        }
        catch(Exception e){
            return newOrderId;
        }
        return  newOrderId;
    }
}