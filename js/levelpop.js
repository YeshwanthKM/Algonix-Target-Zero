/*==============================================================================
Init
==============================================================================*/
$.LevelPop = function( opt ) {
	for( var k in opt ) {
		this[k] = opt[k];
	}
	this.x = $.cw - 20;
	this.y = $.ch - 20;
	this.tick = 0;
	this.tickMax = 240;
	this.baseAlpha = 0.2;
	if( $.tick != 0 ) {
		$.audio.play( 'levelup' );
	}
};

/*==============================================================================
Update
==============================================================================*/
$.LevelPop.prototype.update = function( i ) {
	if( this.tick >= this.tickMax ) {
		$.levelPops.splice( i, 1 );
	} else {
		this.tick += $.dt;
	}
};

/*==============================================================================
Render
==============================================================================*/
$.LevelPop.prototype.render = function( i ) {
	if( this.tick < this.tickMax * 0.25 ) {
		var alpha = ( this.tick / ( this.tickMax * 0.25 ) ) * this.baseAlpha;
	} else if( this.tick > this.tickMax - this.tickMax * 0.25 ) {
		var alpha = ( ( this.tickMax - this.tick ) / ( this.tickMax * 0.25 ) ) * this.baseAlpha;
	} else {
		var alpha = this.baseAlpha;
	}
	alpha = Math.min( 1, Math.max( 0, alpha ) );
	
	$.ctxmg.save();
	$.ctxmg.font = "bold 200px 'Courier New', Courier, monospace";
	$.ctxmg.textBaseline = "bottom";
	$.ctxmg.textAlign = "right";
	$.ctxmg.fillStyle = 'hsla(180, 100%, 50%, ' + alpha + ')'; // Use a cyan glow instead of pure white
	$.ctxmg.shadowBlur = 20;
	$.ctxmg.shadowColor = $.ctxmg.fillStyle;
	$.ctxmg.fillText($.util.pad( this.level, 2 ), this.x, this.y);
	$.ctxmg.restore();
}