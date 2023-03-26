public with sharing class HandleRestroPanel {
    @AuraEnabled(cacheable=true)
    public static List<Object> getPendingOrders(){
        return [SELECT Id,OrderNumber,Status FROM Order WHERE Id IN (SELECT OrderId FROM OrderItem) and Status NOT IN ('Draft', 'Delivered') ];
    } 
    @AuraEnabled
    public static void rejectOrder(string orderId, String comment){
        //delete order items
        List<orderItem> lineItems = [select id from orderItem where orderId =: orderId];
        delete lineItems;
        
        Order orderDetail = [select Id, Status, Comment__c from Order where id =: orderId limit 1];
        orderDetail.Status = 'Draft';
        orderDetail.Comment__c = comment;
        update orderDetail;
    } 
    @AuraEnabled
    public static void acceptOrder(string orderId){
        Order orderDetail = [select Id, Status from Order where id =: orderId limit 1];
        orderDetail.Status = 'Accepted';
        update orderDetail;
    } 
    @AuraEnabled
    public static void delieverOrder(string orderId, String status){
        Order orderDetail = [select Id, Status from Order where id =: orderId limit 1];
        orderDetail.Status = status;
        update orderDetail;
    } 

}