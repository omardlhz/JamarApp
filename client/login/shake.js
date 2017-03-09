/**
 * nombre de archivo: shake.js
 * descripción: Animación de sacudido para login.
 * creado por: Omar De La Hoz (omar.dlhz@hotmail.com)
 */


/**
 * Extensión de JQuery para sacudir formulario de login.
 *
 * @param      {number}  intShakes    Número de sacudidas.
 * @param      {number}  intDistance  Distancia de sacudidas.
 * @param      {number}  intDuration  Duración de sacudidas.
 * @return     {Object}  Extensión de JQuery
 */
jQuery.fn.shake = function(intShakes, intDistance, intDuration) {
  this.each(function() {
    $(this).css("position","relative"); 
    for (var x=1; x<=intShakes; x++) {
      $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/4)))
        .animate({left:intDistance}, ((intDuration/intShakes)/2))
      .animate({left:0}, (((intDuration/intShakes)/4)));
    }
  });
  return this;
};