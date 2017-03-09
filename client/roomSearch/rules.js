/**
 * nombre de archivo: rules.js
 * descripción: Reglas de valifación de fecha.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */


jQuery.validator.addMethod("validDate", 
function(value, element, params) {

	var val = new Date('1/1/1991' + ' ' + value);  
	var par = new Date('1/1/1991' + ' ' + $(params).val());

	if (!/Invalid|NaN/.test(new Date(val))) {

		return new Date(val) > new Date(par);
	}

	return isNaN(val) && isNaN(par) || (Number(val) > Number(par));
});
