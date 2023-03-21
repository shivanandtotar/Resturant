public class CreateAccountOrder {

    @AuraEnabled
    public static ID createRecord(String name){
        Account acc= new Account();
        acc.Name = name;
        Insert acc;
        Pricebook2 book = [select Id from Pricebook2 where name ='Standard Food Menu' limit 1];
        Order orderRecord = new Order();
        system.debug('line10 '+ acc.Id);
        orderRecord.AccountId  = acc.Id;
        orderRecord.EffectiveDate  = System.today();
        orderRecord.Status  = 'Draft';
        orderRecord.Pricebook2Id = book.Id;

        Insert orderRecord;

        return orderRecord.Id;

    }
}