/*==============================================================================
Init
==============================================================================*/
$.Bullet = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.enemiesHit = [];
	this.inView = 0;
	$.particleEmitters.push( new $.ParticleEmitter( {
		x: this.x,
		y: this.y,
		count: 1,
		spawnRange: 1,
		friction: 0.75,
		minSpeed: 2,
		maxSpeed: 10,
		minDirection: 0,
		maxDirection: $.twopi,
		hue: 0,
		saturation: 0
	} ) );
};

/*==============================================================================
Update
==============================================================================*/
$.Bullet.prototype.update = function( i ) {
	/*==============================================================================
	Apply Forces
	==============================================================================*/
	this.x += Math.cos( this.direction ) * ( this.speed * $.dt );
	this.y += Math.sin( this.direction ) * ( this.speed * $.dt );
	this.ex = this.x - Math.cos( this.direction ) * this.size;
	this.ey = this.y - Math.sin( this.direction ) * this.size;

	/*==============================================================================
	Check Collisions
	==============================================================================*/
	var ei = $.enemies.length;
	while( ei-- ) {
		var enemy = $.enemies[ ei ];
		if( $.util.distance( this.x, this.y, enemy.x, enemy.y ) <= enemy.radius ) {
			if( this.enemiesHit.indexOf( enemy.index ) == -1 ){
				$.particleEmitters.push( new $.ParticleEmitter( {
					x: this.x,
					y: this.y,
					count: Math.floor( $.util.rand( 1, 4 ) ),
					spawnRange: 0,
					friction: 0.85,
					minSpeed: 5,
					maxSpeed: 12,
					minDirection: ( this.direction - $.pi ) - $.pi / 5,
					maxDirection: ( this.direction - $.pi ) + $.pi / 5,
					hue: enemy.hue
				} ) );

				this.enemiesHit.push( enemy.index );
				enemy.receiveDamage( ei, this.damage );

				if( this.enemiesHit.length > 3 ) {
					$.bullets.splice( i, 1 );
				}						
			}
			if( !this.piercing ) {
				$.bullets.splice( i, 1 );
			}
		}
	}

	/*==============================================================================
	Lock Bounds
	==============================================================================*/
	if( !$.util.pointInRect( this.ex, this.ey, 0, 0, $.ww, $.wh ) ) {
		$.bullets.splice( i, 1 );
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
$.Bullet.prototype.render = function( i ) {
	if( this.inView ) {
		$.ctxmg.save();
		$.ctxmg.translate( this.x, this.y );
		$.ctxmg.rotate( this.direction );
		
		$.ctxmg.shadowBlur = 15;
		$.ctxmg.shadowColor = this.strokeStyle;
		
		// Outer Plasma
		$.ctxmg.fillStyle = this.strokeStyle;
		$.ctxmg.beginPath();
		// Draw a horizontal pill shape oriented entirely differently than the original line
		$.ctxmg.ellipse( -this.size / 2, 0, this.size, this.size / 2.5, 0, 0, Math.PI * 2 );
		$.ctxmg.fill();

		// Inner bright core
		$.ctxmg.fillStyle = '#fff';
		$.ctxmg.beginPath();
		$.ctxmg.ellipse( -this.size / 2, 0, this.size * 0.6, this.size / 4, 0, 0, Math.PI * 2 );
		$.ctxmg.fill();
		
		$.ctxmg.restore();
	}
};