define(["knockout", "form2", "spaform"], function(ko, RUNTIME, SPAFORM ) {
return function(message, transition, from, to, current) {
  this.message    = message;
  this.transition = transition;
  this.from       = from;
  this.to         = to;
  this.current    = current;
}
});