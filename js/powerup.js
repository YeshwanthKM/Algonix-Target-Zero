/*==============================================================================
Init
==============================================================================*/
$.Powerup = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.radius = 15;
	this.width = this.radius * 2;
	this.height = this.radius * 2;
	this.x = this.x - this.width / 2;
	this.y = this.y - this.height / 2;
	this.direction = $.util.rand( 0, $.twopi );
	this.speed = $.util.rand( 0.5, 2 );
	this.pulse = 0;
};

/*==============================================================================
Update
==============================================================================*/
$.Powerup.prototype.update = function( i ) {
	/*==============================================================================
	Apply Forces
	==============================================================================*/
	this.x += Math.cos( this.direction ) * this.speed * $.dt;
	this.y += Math.sin( this.direction ) * this.speed * $.dt;
	this.pulse += 0.1 * $.dt;

	/*==============================================================================
	Check Bounds
	==============================================================================*/
	if( !$.util.rectInRect( this.x, this.y, this.width, this.height, 0, 0, $.ww, $.wh ) ){
		$.powerups.splice( i, 1 );
	}

	/*==============================================================================
	Check Collection Collision
	==============================================================================*/
	if( $.hero.life > 0 && $.util.arcIntersectingRect( $.hero.x, $.hero.y, $.hero.radius + 2, this.x, this.y, this.width, this.height ) ){
		$.audio.play( 'powerup' );
		$.powerupTimers[ this.type ] = 300;
		$.particleEmitters.push( new $.ParticleEmitter( {
			x: this.x + this.width / 2,
			y: this.y + this.height / 2,
			count: 15,
			spawnRange: 0,
			friction: 0.85,
			minSpeed: 2,
			maxSpeed: 15,
			minDirection: 0,
			maxDirection: $.twopi,
			hue: this.hue,
			saturation: this.saturation
		} ) );
		$.powerups.splice( i, 1 );
		$.powerupsCollected++;
	}
};

/*==============================================================================
Render
==============================================================================*/
$.Powerup.prototype.render = function( i ) {
	$.ctxmg.save();
	$.ctxmg.translate( this.x + this.radius, this.y + this.radius );
	$.ctxmg.rotate( this.pulse );
	
	// Glowing Cyber Hexagon
	var color = 'hsl(' + this.hue + ', ' + this.saturation + '%, ' + this.lightness + '%)';
	
	$.ctxmg.shadowBlur = 15;
	$.ctxmg.shadowColor = color;
	$.ctxmg.fillStyle = 'hsla(0, 0%, 5%, 0.9)';
	$.ctxmg.strokeStyle = color;
	$.ctxmg.lineWidth = 3;
	
	$.ctxmg.beginPath();
	for (var j = 0; j < 6; j++) {
		var angle = (j * Math.PI / 3);
		var px = Math.cos(angle) * this.radius;
		var py = Math.sin(angle) * this.radius;
		if(j===0) $.ctxmg.moveTo(px, py);
		else $.ctxmg.lineTo(px, py);
	}
	$.ctxmg.closePath();
	$.ctxmg.fill();
	$.ctxmg.stroke();

	// Inner core
	$.ctxmg.fillStyle = color;
	$.ctxmg.scale(0.5 + Math.sin(this.pulse)*0.2, 0.5 + Math.sin(this.pulse)*0.2); // Pulsing core
	$.ctxmg.beginPath();
	for (var j = 0; j < 6; j++) {
		var angle = (j * Math.PI / 3);
		var px = Math.cos(angle) * this.radius;
		var py = Math.sin(angle) * this.radius;
		if(j===0) $.ctxmg.moveTo(px, py);
		else $.ctxmg.lineTo(px, py);
	}
	$.ctxmg.closePath();
	$.ctxmg.fill();

	// Draw Initial Native Text without rotation
	$.ctxmg.restore();
	$.ctxmg.save();
	$.ctxmg.translate( this.x + this.radius, this.y + this.radius );
	$.ctxmg.font = "bold 14px 'Courier New', Courier, monospace";
	$.ctxmg.textBaseline = "middle";
	$.ctxmg.textAlign = "center";
	$.ctxmg.fillStyle = "#fff";
	$.ctxmg.shadowBlur = 5;
	$.ctxmg.shadowColor = "#000";
	$.ctxmg.fillText(this.title.charAt(0), 0, 0); // Just the first letter 
	$.ctxmg.restore();
}