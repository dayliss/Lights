var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
		width = 750,
		height = 750,
		entity = {
		  fill:"blue",
			stroke:"yellow",
			radius:5,
			x:width/2,
			y:height/2,
			t:0,
			r:100,
			vR:0,
			vT:0,
			acel:0.1,
			speed:5,
			rBounds:30
		},
		friction = 0.97,
		lights = [],
		keys = [],
		backGround = "black";
canvas.width = width;
canvas.height = height;

entity.bound = function(){
  //lower bounding
	if(this.r < this.rBounds){
		this.r = this.rBounds;
		this.vR *= -1;
	}
	
	//upper bounding
	if(this.x < (this.radius*2)){
	  this.x = (this.radius*2);
	  this.r = Math.sqrt(Math.pow(this.x-width/2,2)+Math.pow(this.y-height/2,2));
		this.vR *= -1;
	}
	if(this.y < (this.radius*2)){
	  this.y = (this.radius*2);
	  this.r = Math.sqrt(Math.pow(this.x-width/2,2)+Math.pow(this.y-height/2,2));
		this.vR *= -1;
	}
	if(this.x > width-(this.radius*2)){
	  this.x = width-(this.radius*2);
	  this.r = Math.sqrt(Math.pow(this.x-width/2,2)+Math.pow(this.y-height/2,2));
		this.vR *= -1;
	}
	if(this.y > height-(this.radius*2)){
	  this.y = height-(this.radius*2);
	  this.r = Math.sqrt(Math.pow(this.x-width/2,2)+Math.pow(this.y-height/2,2));
		this.vR *= -1;
	}
	
	if(this.t > Math.PI*2){
	  this.t = 0;
	}
	if(this.t < 0){
	  this.t = Math.PI*2
	}
}

entity.draw = function(){
	var grd = ctx.createRadialGradient(this.x,this.y,this.radius,this.x,this.y,this.radius*4);
	grd.addColorStop(0,this.fill);
	grd.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(this.x,this.y,this.radius*4,0,Math.PI*2,false);
	ctx.fill();
}

entity.setPos = function(){
  this.r += this.vR;
  this.t += this.vT/(this.r);
	
  this.x = (this.r*Math.cos(this.t))+width/2;
	this.y = (this.r*(Math.sin(this.t)*-1))+height/2;
}

var player = Object.create(entity);

function newLight(){
  var light = Object.create(entity);
	light.fill = "yellow";
	light.stroke = "rgba(0,0,0,0)";
	light.touched = false;
	light.r = (Math.random()*100)+20;
	light.t = (Math.random()*Math.PI*2);
	light.update = function(){
	  //manipulation
		if(Math.abs(this.vT) <= this.speed/20){
		  this.vT = (Math.random()*this.speed*2)-this.speed
		}
		if(Math.abs(this.vR) <= this.speed/20){
		  this.vR = (Math.random()*this.speed*2)-this.speed
		}
		
		//touching
		if(!this.touched){
	  	if(Math.sqrt(Math.pow(this.x-player.x,2)+Math.pow(this.y-player.y,2)) <= this.radius+player.radius){
	  	  this.touched = true;
	  		newLight();
	  	}
		}
		
		//friction
		this.vT *= friction;
		this.vR *= friction;
		
		//bounding
		this.bound();
		
		//changing
		this.setPos();
		
		//color
		if(this.touched){
		  this.fill = "yellow";
		}
		else{
		  this.fill = "green";
		}
	  
		//changing size
		this.radius = Math.abs(this.vT)+Math.abs(this.vR)+3;
	}
	lights.push(light);
}

player.update = function(){
  //player input
	var moving = {t:false,r:false};
	if(keys[37]){ //left
	  if(this.vT+this.acel <= this.speed){
		  this.vT += this.acel;
		}
		else{
		  this.vT = this.speed;
		}
		moving.t = true;
	}
	if(keys[38]){ //up
	  if(this.vR+this.acel <= this.speed){
		  this.vR += this.acel;
		}
		else{
		  this.vR = this.speed;
		}
		moving.r = true;
	}
	if(keys[39]){ //right
	  if(this.vT-this.acel >= -1 * this.speed){
		  this.vT -= this.acel;
		}
		else{
		  this.vT = -1 * this.speed;
		}
		moving.t = true;
	}
	if(keys[40]){ //down
	  if(this.vR-this.acel >= -1 * this.speed){
		  this.vR -= this.acel;
		}
		else{
		  this.vR = -1 * this.speed;
		}
		moving.r = true;
	}
	
	//friction
	if(!moving.r){
	  this.vR *= friction;
		if(Math.abs(this.vR) <= this.speed/100){
		  this.vR = 0;
		}
	}
	if(!moving.t){
	  this.vT *= friction;
		if(Math.abs(this.vT) <= this.speed/100){
		  this.vT = 0;
		}
	}
	//bounding
	this.bound();
	
	//changes
  this.setPos();
	
	//colors
	this.fill = "rgba("+Math.floor(Math.abs(this.vR*255/this.speed))+","+0+","+Math.floor(Math.abs(this.vT*255/this.speed))+",1)";
}

function drawCenter(){
  var grd = ctx.createRadialGradient(width/2,height/2,0,width/2,height/2,lights.length*2);
	grd.addColorStop(0,"orange");
	grd.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(width/2,height/2,lights.length*2,0,Math.PI*2,false);
	ctx.fill();
}

function clear(){
  ctx.clearRect(0,0,width,height);
	ctx.fillStyle = backGround;
	ctx.fillRect(0,0,width,height);
}

function update(){
  clear();
  player.update();
	for(var i = 0; i < lights.length; i++){
	  lights[i].update();
		lights[i].draw();
	}
	player.draw();
	drawCenter();
  window.requestAnimationFrame(update);
}


document.body.addEventListener("keydown", function(e) {
		keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function(e) {
		keys[e.keyCode] = false;
});

newLight();
newLight();
update();
