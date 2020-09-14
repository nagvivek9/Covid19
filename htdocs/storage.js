function dataStore() {

 this.supported_storage = "cookie";
 this.initialize = function() {
  try {
   if(localStorage) {
    this.supported_storage = 'localstore';
    return;
   }
  }
  catch(error) {
   console.log("getSupportedStorage - localStorage does not work");
  }
  try {
   if(document.cookie) {
    this.supported_storage = 'cookie';
   }
  }
  catch(error) {
   console.log("getSupportedStorage - exception - cookie does not work");
  }
 };

 this.storeLocalData = function(key, value) {
  if(this.supported_storage == 'localstore')
   localStorage[key]= value;
  else if(this.supported_storage == 'cookie')
   this.setCookie(key,value,365);
 };

 this.getLocalData = function(key, defaultValue) {
  var value = '';
  if(this.supported_storage == 'localstore') {
   if(localStorage[key]) {
    value = localStorage[key];
   }
  }
  else if(this.supported_storage == 'cookie')
   value = this.getCookie(key);

  if(value == '' || value == null)
   value = defaultValue;

  return value;
 };
}
