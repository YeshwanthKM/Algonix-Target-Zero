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
		// Optimized: No context saves/restores or translations. 
		// Drawing directly via coordinates is much faster for hundreds of particles.
		var size = this.speed; 
		var alpha = Math.min(1, this.speed / 5);
		$.ctxmg.fillStyle = 'hsla(' + this.hue + ', ' + this.saturation + '%, ' + $.util.rand( 50, 100 ) + '%, ' + alpha + ')';
		$.ctxmg.fillRect(this.x - size/2, this.y - size/2, size, size);
	}
};