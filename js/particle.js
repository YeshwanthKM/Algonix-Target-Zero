/*==============================================================================
Init
==============================================================================*/
$.Particle = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
};

/*==============================================================================
Update
==============================================================================*/
$.Particle.prototype.update = function( i ) {
	/*==============================================================================
	Apply Forces
	==============================================================================*/
	this.x += Math.cos( this.direction ) * ( this.speed * $.dt );
	this.y += Math.sin( this.direction ) * ( this.speed * $.dt );
	this.ex = this.x - Math.cos( this.direction ) * this.speed;
	this.ey = this.y - Math.sin( this.direction ) * this.speed;
	this.speed *= this.friction;

	/*==============================================================================
	Lock Bounds
	==============================================================================*/
	if( !$.util.pointInRect( this.ex, this.ey, 0, 0, $.ww, $.wh ) || this.speed <= 0.05 ) {
		this.parent.splice( i, 1 );
	}

	/*==============================================================================
	Update View
	==============================================================================*/
	if( $.util.pointInRect( this.ex, this.ey, -$.screen.x, -$.screen.y, $.cw, $.ch ) ) {
		this.inView = 1;
	} else {
		this.inView = 0;
	}
};

/*==============================================================================
Render
==============================================================================*/
$.Particle.prototype.render = function( i ) {
	if( this.inView ) {
		$.ctxmg.save();
		$.ctxmg.translate( this.x, this.y );
		
		var size = this.speed; 
		var color = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand( 50, 100 ) + '%, ' + Math.min(1, this.speed / 5) + ')';
		
		$.ctxmg.fillStyle = color;
		$.ctxmg.fillRect(-size/2, -size/2, size, size);
		
		$.ctxmg.restore();
	}
};