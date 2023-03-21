/* eslint-disable no-console */
/* eslint-disable no-alert */
import { LightningElement } from 'lwc';
import createRecord from '@salesforce/apex/CreateAccountOrder.createRecord';
import { NavigationMixin } from 'lightning/navigation';

export default class CreateOrder extends NavigationMixin(LightningElement) {
    accName = ''
    handleAccountName(event) {
        this.accName = event.target.value;
        var letters = /^[A-Za-z]+$/;
        let inputField = this.template.querySelector('lightning-input');
        if (this.accName.match(letters)) {
            //valid
            this.notValid = false;
            inputField.setCustomValidity('');
        }
        else {
            inputField.setCustomValidity('Please Enter Valid name');
            this.notValid = true;
        }
        inputField.reportValidity();
        console.log('line9 ', this.accName)
    }

    handleClick() {
        createRecord({ name: this.accName })
            .then((result) => {
                let orderIdCreated = result;
                console.error('order created!! ', orderIdCreated);
                window.location.assign('/' + orderIdCreated);
                this.error = undefined;
            })
            .catch((error) => {
                console.error(error)
                this.error = error;
            });
    }
}