/*==============================================================================
Init
==============================================================================*/
$.init = function() {
	$.setupStorage();
	$.wrap = document.getElementById( 'wrap' );
	$.wrapInner = document.getElementById( 'wrap-inner' );
	$.cbg1 = document.getElementById( 'cbg1' );
	$.cbg2 = document.getElementById( 'cbg2' );
	$.cbg3 = document.getElementById( 'cbg3' );
	$.cbg4 = document.getElementById( 'cbg4' );
	$.cmg = document.getElementById( 'cmg' );
	$.cfg = document.getElementById( 'cfg' );	
	$.ctxbg1 = $.cbg1.getContext( '2d' );
	$.ctxbg2 = $.cbg2.getContext( '2d' );
	$.ctxbg3 = $.cbg3.getContext( '2d' );
	$.ctxbg4 = $.cbg4.getContext( '2d' );
	$.ctxmg = $.cmg.getContext( '2d' );
	$.ctxfg = $.cfg.getContext( '2d' );
	$.cw = $.cmg.width = $.cfg.width = 800;
	$.ch = $.cmg.height = $.cfg.height = 600;
	$.wrap.style.width = $.wrapInner.style.width = $.cw + 'px';
	$.wrap.style.height = $.wrapInner.style.height = $.ch + 'px';
	if (window.parent === window) {
		$.wrap.className += ' centered';
	} else {
		$.wrap.className += ' duel-mode';
	}
	$.ww = Math.floor( $.cw * 2 );
	$.wh = Math.floor( $.ch * 2 );
	$.cbg1.width = Math.floor( $.cw * 1.1 );
	$.cbg1.height = Math.floor( $.ch * 1.1 );
	$.cbg2.width = Math.floor( $.cw * 1.15 );
	$.cbg2.height = Math.floor( $.ch * 1.15 );
	$.cbg3.width = Math.floor( $.cw * 1.2 );
	$.cbg3.height = Math.floor( $.ch * 1.2 );
	$.cbg4.width = Math.floor( $.cw * 1.25 );
	$.cbg4.height = Math.floor( $.ch * 1.25 );

	$.screen = {
		x: ( $.ww - $.cw ) / -2,
		y: ( $.wh - $.ch ) / -2
	};

	$.mute = $.storage['mute'];
	$.autofire = $.storage['autofire'];
	$.slowEnemyDivider = 3;	

	$.keys = {
		state: {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			f: 0,
			m: 0,
			p: 0
		},
		pressed: {
			up: 0,
			down: 0,
			left: 0,
			right: 0,
			f: 0,
			m: 0,
			p: 0
		}
	};
	$.okeys = {};
	$.mouse = {
		x: $.ww / 2,
		y: $.wh / 2,
		sx: 0,
		sy: 0,
		ax: window.innerWidth / 2,
		ay: 0,
		down: 0
	};
	$.buttons = [];

	$.minimap = {		
		x: Math.floor( $.cw - ($.cw * 0.1) - 20 ),
		y: 20,
		width: Math.floor( $.cw * 0.1 ),
		height: Math.floor( $.ch * 0.1 ),
		scale: Math.floor( $.cw * 0.1 ) / $.ww,
		color: 'hsla(180, 100%, 10%, 0.6)', 
		strokeColor: 'hsla(180, 100%, 50%, 0.8)'
	},	
	$.cOffset = { 
		left: 0, 
		top: 0 
	};
	
	$.levelCount = $.definitions.levels.length;
	$.states = {};
	$.state = '';
	$.enemies = [];
	$.bullets = [];
	$.explosions = [];
	$.powerups = [];	
	$.particleEmitters = [];
	$.textPops = [];
	$.levelPops = [];
	$.powerupTimers = [];

	$.resizecb();
	$.bindEvents();
	$.setupStates();	
	$.renderBackground1();
	$.renderBackground2();
	$.renderBackground3();
	$.renderBackground4();
	$.renderFavicon();
	if (!$.isDuelStarted) {
		console.log('Frame initializing to Menu:', $.mode);
		$.setState( 'menu' );
	} else {
		console.log('Frame initialization SKIPPED MENU (already started):', $.mode);
	}
	$.loop();
};

/*==============================================================================
Reset
==============================================================================*/
$.reset = function() {
	$.indexGlobal = 0;
	$.dt = 1;
	$.lt = 0;
	$.elapsed = 0;
	$.tick = 0;

	$.gameoverTick = 0;
	$.gameoverTickMax = 200;
	$.gameoverExplosion = 0;

	$.instructionTick = 0;
	$.instructionTickMax = 400;

	$.levelDiffOffset = 0;
	$.enemyOffsetMod = 0;
	$.slow = 0;

	$.screen = {
		x: ( $.ww - $.cw ) / -2,
		y: ( $.wh - $.ch ) / -2
	};
	$.rumble = {
		x: 0,
		y: 0,
		level: 0,
		decay: 0.4
	};	

	$.mouse.down = 0;

	$.level = {
		current: 0,
		kills: 0,
		killsToLevel: $.definitions.levels[ 0 ].killsToLevel,
		distribution: $.definitions.levels[ 0 ].distribution,
		distributionCount: $.definitions.levels[ 0 ].distribution.length
	};

	$.enemies.length = 0;
	$.bullets.length = 0;
	$.explosions.length = 0;
	$.powerups.length = 0;
	$.particleEmitters.length = 0;
	$.textPops.length = 0;
	$.levelPops.length = 0;
	$.powerupTimers.length = 0;

	for( var i = 0; i < $.definitions.powerups.length; i++ ) {
		$.powerupTimers.push( 0 );
	}

	$.kills = 0;
	$.bulletsFired = 0;
	$.powerupsCollected = 0;
	$.score = 0;

	$.hero = new $.Hero();

	$.levelPops.push( new $.LevelPop( {
		level: 1
	} ) );
};

/*==============================================================================
Create Favicon
==============================================================================*/
$.renderFavicon = function() {
	var favicon = document.getElementById( 'favicon' ),
		favc = document.createElement( 'canvas' ),
		favctx = favc.getContext( '2d' ),
		faviconGrid = [
			[ 1, 1, 1, 1, 1,  ,  , 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1, 1, 1, 1,  , 0 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1, 1, 1, 1,  , 0 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  , 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[  ,  , 1, 1, 1, 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[  ,  , 1, 1, 1, 1, 1,  ,  , 1, 1,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  , 1 ],
			[ 1, 1, 1, 1, 1, 1, 1, 1, 1,  ,  , 1, 1, 1, 1, 1 ]
		];
	favc.width = favc.height = 16;
	favctx.beginPath();
	for( var y = 0; y < 16; y++ ) {
		for( var x = 0; x < 16; x++ ) {
			if( faviconGrid[ y ][ x ] === 1 ) {
				favctx.rect( x, y, 1, 1 );
			}
		}
	}
	favctx.fill();
	favicon.href = favc.toDataURL();
};

/*==============================================================================
Render Backgrounds
==============================================================================*/
$.renderBackground1 = function() {
	// Deep Cyberpunk Space Gradient
	var gradient = $.ctxbg1.createRadialGradient( $.cbg1.width / 2, $.cbg1.height / 2, 0, $.cbg1.width / 2, $.cbg1.height / 2, $.cbg1.height );
	gradient.addColorStop( 0, 'hsla(280, 80%, 10%, 1)' );
	gradient.addColorStop( 0.65, 'hsla(260, 100%, 2%, 1)' );
	$.ctxbg1.fillStyle = gradient;
	$.ctxbg1.fillRect( 0, 0, $.cbg1.width, $.cbg1.height );

	// Sparse Neon Dust (Reduced for performance)
	var i = 200;
	while( i-- ) {
		var hue = $.util.rand( 0, 1 ) > 0.5 ? 300 : 180;
		$.util.fillCircle( $.ctxbg1, $.util.rand( 0, $.cbg1.width ), $.util.rand( 0, $.cbg1.height ), $.util.rand( 0.2, 0.5 ), 'hsla(' + hue + ', 100%, 50%, ' + $.util.rand( 0.05, 0.3 ) + ')' );
	}
}

$.renderBackground2 = function() {
	var i = 100;
	while( i-- ) {
		var hue = $.util.rand( 0, 1 ) > 0.5 ? 300 : 180;
		$.util.fillCircle( $.ctxbg2, $.util.rand( 0, $.cbg2.width ), $.util.rand( 0, $.cbg2.height ), $.util.rand( 1, 2.5 ), 'hsla(' + hue + ', 100%, 50%, ' + $.util.rand( 0.1, 0.25 ) + ')' );
	}
}

$.renderBackground3 = function() {
	var i = 30;
	while( i-- ) {
		var hue = $.util.rand( 180, 220 );
		// shadowBlur removed for light mode
		$.util.fillCircle( $.ctxbg3, $.util.rand( 0, $.cbg3.width ), $.util.rand( 0, $.cbg3.height ), $.util.rand( 2, 5 ), 'hsla(' + hue + ', 100%, 50%, ' + $.util.rand( 0.05, 0.2 ) + ')' );
	}
}

$.renderBackground4 = function() {
	var size = 200; // Even larger synthwave grid for less drawing
	$.ctxbg4.fillStyle = 'hsla(180, 100%, 50%, 0.06)'; // Fainter lines
	var i = Math.round( $.cbg4.height / size );
	while( i-- ) {
		$.ctxbg4.fillRect( 0, i * size + 50, $.cbg4.width, 1 );
	}
	i = Math.round( $.cbg4.width / size );
	while( i-- ) {
		$.ctxbg4.fillRect( i * size, 0, 1, $.cbg4.height );
	}
}

/*==============================================================================
Render Foreground
==============================================================================*/
$.renderForeground = function() {
	var gradient = $.ctxfg.createRadialGradient( $.cw / 2, $.ch / 2, $.ch / 3, $.cw / 2, $.ch / 2, $.ch );
	gradient.addColorStop( 0, 'hsla(0, 0%, 0%, 0)' );
	gradient.addColorStop( 1, 'hsla(0, 0%, 0%, 0.5)' );
	$.ctxfg.fillStyle = gradient;
	$.ctxfg.fillRect( 0, 0, $.cw, $.ch );

	$.ctxfg.fillStyle = 'hsla(0, 0%, 50%, 0.1)';
	var i = Math.round( $.ch / 2 );
	while( i-- ) {
		$.ctxfg.fillRect( 0, i * 2, $.cw, 1 );
	}

	var gradient2 = $.ctxfg.createLinearGradient( $.cw, 0, 0, $.ch );
	gradient2.addColorStop( 0, 'hsla(0, 0%, 100%, 0.04)' );
	gradient2.addColorStop( 0.75, 'hsla(0, 0%, 100%, 0)' );
	$.ctxfg.beginPath();
	$.ctxfg.moveTo( 0, 0 );
	$.ctxfg.lineTo( $.cw, 0 );
	$.ctxfg.lineTo( 0, $.ch );
	$.ctxfg.closePath();
	$.ctxfg.fillStyle = gradient2;
	$.ctxfg.fill();
}

/*==============================================================================
User Interface / UI / GUI / Minimap
==============================================================================*/

$.renderInterface = function() {
	/*==============================================================================
	Powerup Timers (Centered underneath Score)
	==============================================================================*/
		for( var i = 0; i < $.definitions.powerups.length; i++ ) {
			var powerup = $.definitions.powerups[ i ],
				powerupOn = ( $.powerupTimers[ i ] > 0 );
			
			if (powerupOn) {
				var px = $.cw / 2 - 50;
				var py = 60 + (i * 12);
				
				$.ctxmg.beginPath();
				$.ctxmg.font = "10px 'Courier New', Courier, monospace";
				$.ctxmg.textAlign = "right";
				$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + ( 0.25 + ( ( $.powerupTimers[ i ] / 300 ) * 0.75 ) ) + ')';
				$.ctxmg.fillText(powerup.title, px - 10, py);

				var powerupBar = {
					x: px,
					y: py - 4,
					width: 100,
					height: 4
				};
				$.ctxmg.fillStyle = 'hsl(' + powerup.hue + ', ' + powerup.saturation + '%, ' + powerup.lightness + '%)';
				$.ctxmg.fillRect( powerupBar.x, powerupBar.y, ( $.powerupTimers[ i ] / 300 ) * powerupBar.width, powerupBar.height );
			}
		}

		/*==============================================================================
		Instructions
		==============================================================================*/
		if( $.instructionTick < $.instructionTickMax ){
			$.instructionTick += $.dt;
			
			var alpha = 0.5;
			if( $.instructionTick < $.instructionTickMax * 0.25 ) {
				alpha = ( $.instructionTick / ( $.instructionTickMax * 0.25 ) ) * 0.5;
			} else if( $.instructionTick > $.instructionTickMax - $.instructionTickMax * 0.25 ) {
				alpha = ( ( $.instructionTickMax - $.instructionTick ) / ( $.instructionTickMax * 0.25 ) ) * 0.5;
			}
			alpha = Math.min( 1, Math.max( 0, alpha ) );
			
			$.ctxmg.font = "bold 18px 'Courier New', Courier, monospace";
			$.ctxmg.textBaseline = "bottom";
			
			// Left column (Keys)
			$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
			$.ctxmg.textAlign = 'right';
			$.ctxmg.fillText('MOVE', $.cw / 2 - 10, $.ch / 2 + 100);
			$.ctxmg.fillText('AIM/FIRE', $.cw / 2 - 10, $.ch / 2 + 120);
			$.ctxmg.fillText('AUTOFIRE', $.cw / 2 - 10, $.ch / 2 + 140);
			$.ctxmg.fillText('PAUSE', $.cw / 2 - 10, $.ch / 2 + 160);
			$.ctxmg.fillText('MUTE', $.cw / 2 - 10, $.ch / 2 + 180);

			// Right column (Actions)
			alpha = alpha * 2; // Right column is slightly brighter
			alpha = Math.min( 1, Math.max( 0, alpha ) );
			$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, ' + alpha + ')';
			$.ctxmg.textAlign = 'left';
			$.ctxmg.fillText('WASD/ARROWS', $.cw / 2 + 10, $.ch / 2 + 100);
			$.ctxmg.fillText('MOUSE', $.cw / 2 + 10, $.ch / 2 + 120);
			$.ctxmg.fillText('F', $.cw / 2 + 10, $.ch / 2 + 140);
			$.ctxmg.fillText('P', $.cw / 2 + 10, $.ch / 2 + 160);
			$.ctxmg.fillText('M', $.cw / 2 + 10, $.ch / 2 + 180);
		}

		/*==============================================================================
		Slow Enemies Screen Cover
		==============================================================================*/
		if( $.powerupTimers[ 1 ] > 0 ) {
			$.ctxmg.fillStyle = 'hsla(200, 100%, 20%, 0.05)';
			$.ctxmg.fillRect( 0, 0, $.cw, $.ch );
		}

	/*==============================================================================
	Health & Progress (Redesigned Cyberpunk HUD)
	==============================================================================*/
	$.ctxmg.font = "bold 16px 'Courier New', Courier, monospace";
	$.ctxmg.textBaseline = "top";

	// Health (Bottom Left)
	$.ctxmg.textAlign = "left";
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.7)';
	$.ctxmg.fillText('INTEGRITY', 20, $.ch - 40);
	
	var healthBar = { x: 120, y: $.ch - 40, width: 200, height: 12 };
	
	// Flat Background Bar
	$.ctxmg.fillStyle = 'hsla(0, 0%, 20%, 0.8)';
	$.ctxmg.fillRect(healthBar.x, healthBar.y, healthBar.width, healthBar.height);

	// Flat Foreground Bar
	if( $.hero.life > 0 ) {
		var lifeWidth = $.hero.life * healthBar.width;
		$.ctxmg.fillStyle = 'hsla(' + $.hero.life * 120 + ', 100%, 60%, 1)';
		$.ctxmg.fillRect(healthBar.x, healthBar.y, lifeWidth, healthBar.height);
	}

	// Damage particles disabled for performance
	/*
	if( $.hero.takingDamage && $.hero.life > 0.01 ) {
        ...
	}
	*/

	// Progress (Bottom Right/Center)
	var progX = $.cw - 350;
	$.ctxmg.textAlign = "right";
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.7)';
	$.ctxmg.fillText('WAVE SYNC', progX, $.ch - 40);

	var progressBar = { x: progX + 20, y: $.ch - 40, width: 200, height: 12 };
	var progRatio = Math.min(1, $.level.kills / $.level.killsToLevel);

	// Flat Background Bar
	$.ctxmg.fillStyle = 'hsla(0, 0%, 20%, 0.8)';
	$.ctxmg.fillRect(progressBar.x, progressBar.y, progressBar.width, progressBar.height);

	if (progRatio > 0) {
		var progWidth = progRatio * progressBar.width;
		$.ctxmg.fillStyle = 'hsla(180, 100%, 60%, 1)';
		$.ctxmg.fillRect(progressBar.x, progressBar.y, progWidth, progressBar.height);
	}

	if( $.level.kills == $.level.killsToLevel ) {
		$.particleEmitters.push( new $.ParticleEmitter( {
			x: -$.screen.x + progressBar.x + progressBar.width,
			y: -$.screen.y + progressBar.y + progressBar.height / 2,
			count: 30,
			spawnRange: 5,
			friction: 0.95,
			minSpeed: 2,
			maxSpeed: 25,
			minDirection: 0,
			minDirection: $.pi / 2 - $.pi / 4,
			maxDirection: $.pi / 2 + $.pi / 4,
			hue: 0,
			saturation: 0
		} ) );
	}

	// Score (Top Center)
	$.ctxmg.textAlign = "center";
	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.7)';
	$.ctxmg.fillText('DATA STREAM', $.cw / 2, 10);
	
	$.ctxmg.font = "bold 24px 'Courier New', Courier, monospace";
	$.ctxmg.fillStyle = 'hsla(300, 100%, 60%, 1)';
	// shadowBlur removed for performance
	$.ctxmg.fillText($.util.pad( $.score, 6 ), $.cw / 2, 35);
};

$.renderMinimap = function() {
	$.ctxmg.fillStyle = $.minimap.color;
	$.ctxmg.fillRect( $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height );

	$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.1)';
	$.ctxmg.fillRect( 
		Math.floor( $.minimap.x + -$.screen.x * $.minimap.scale ), 
		Math.floor( $.minimap.y + -$.screen.y * $.minimap.scale ), 
		Math.floor( $.cw * $.minimap.scale ), 
		Math.floor( $.ch * $.minimap.scale )
	);

	//$.ctxmg.beginPath();
	for( var i = 0; i < $.enemies.length; i++ ){
		var enemy = $.enemies[ i ],
			x = $.minimap.x + Math.floor( enemy.x * $.minimap.scale ),
			y = $.minimap.y + Math.floor( enemy.y * $.minimap.scale );
		if( $.util.pointInRect( x + 1, y + 1, $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height ) ) {
			//$.ctxmg.rect( x, y, 2, 2 );
			$.ctxmg.fillStyle = 'hsl(' + enemy.hue + ', ' + enemy.saturation + '%, 50%)';
			$.ctxmg.fillRect( x, y, 2, 2 );
		}
	}
	//$.ctxmg.fillStyle = '#f00';
	//$.ctxmg.fill();

	$.ctxmg.beginPath();
	for( var i = 0; i < $.bullets.length; i++ ){
		var bullet = $.bullets[ i ],
			x = $.minimap.x + Math.floor( bullet.x * $.minimap.scale ),
			y = $.minimap.y + Math.floor( bullet.y * $.minimap.scale );
		if( $.util.pointInRect( x, y, $.minimap.x, $.minimap.y, $.minimap.width, $.minimap.height ) ) {
			$.ctxmg.rect( x, y, 1, 1 );
		}
	}
	$.ctxmg.fillStyle = '#fff';
	$.ctxmg.fill();

	$.ctxmg.fillStyle = $.hero.fillStyle;
	$.ctxmg.fillRect( $.minimap.x + Math.floor( $.hero.x * $.minimap.scale ), $.minimap.y + Math.floor( $.hero.y * $.minimap.scale ), 2, 2 );

	$.ctxmg.strokeStyle = $.minimap.strokeColor;
	$.ctxmg.strokeRect( $.minimap.x - 0.5, $.minimap.y - 0.5, $.minimap.width + 1, $.minimap.height + 1 );
};

/*==============================================================================
Enemy Spawning
==============================================================================*/
$.getSpawnCoordinates = function( radius ) {
	var quadrant = Math.floor( $.util.rand( 0, 4 ) ),
		x,
		y,
		start;
	
	if( quadrant === 0){
		x = $.util.rand( 0, $.ww );
		y = -radius;
		start = 'top';
	} else if( quadrant === 1 ){
		x = $.ww + radius;
		y = $.util.rand( 0, $.wh );
		start = 'right';
	} else if( quadrant === 2 ) {
		x = $.util.rand( 0, $.ww );
		y = $.wh + radius;
		start = 'bottom';
	} else {
		x = -radius;
		y = $.util.rand( 0, $.wh );
		start = 'left';
	}

	return { x: x, y: y, start: start };
};

$.spawnEnemy = function( type ) {
	var params = $.definitions.enemies[ type ],
		coordinates = $.getSpawnCoordinates( params.radius );
	params.x = coordinates.x;
	params.y = coordinates.y;
	params.start = coordinates.start;
	params.type = type;
	return new $.Enemy( params );
};

$.spawnEnemies = function() {
	var floorTick = Math.floor( $.tick );
	for( var i = 0; i < $.level.distributionCount; i++ ) {
		var timeCheck = $.level.distribution[ i ];		
		if( $.levelDiffOffset > 0 ){
			timeCheck = Math.max( 1, timeCheck - ( $.levelDiffOffset * 2) );
		}
		if( floorTick % timeCheck === 0 ) {
			$.enemies.push( $.spawnEnemy( i ) );
		}
	}
};

/*==============================================================================
Events
==============================================================================*/
$.mousemovecb = function( e ) {
	if ( $.mode === 'ai' ) return;
	e.preventDefault();
	var rect = $.cmg.getBoundingClientRect();
	// Calculate coordinates relative to the canvas, accounting for CSS scale
	$.mouse.sx = (e.clientX - rect.left) * ($.cw / rect.width);
	$.mouse.sy = (e.clientY - rect.top) * ($.ch / rect.height);
	$.mouse.x = $.mouse.sx - $.screen.x;
	$.mouse.y = $.mouse.sy - $.screen.y;
};

$.mousescreen = function() {
	// Function kept for compatibility, but logic is now in mousemovecb
};

$.mousedowncb = function( e ) {
	if ( $.mode === 'ai' ) return;
	e.preventDefault();
	$.mousemovecb( e ); // Ensure coordinates are fresh on click
	$.mouse.down = 1;
};

$.mouseupcb = function( e ) {
	if ( $.mode === 'ai' ) return;
	e.preventDefault();
	$.mouse.down = 0;
};

$.keydowncb = function( e ) {
	if ( $.mode === 'ai' ) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	var code = ( e.keyCode ? e.keyCode : e.which );
	// Prevent default for game keys to stop scrolling/navigation
	if( [32, 37, 38, 39, 40, 87, 65, 83, 68].indexOf(code) > -1 ) {
		e.preventDefault();
	}
	if( code === 38 || code === 87 ){ $.keys.state.up = 1; }
	if( code === 39 || code === 68 ){ $.keys.state.right = 1; }
	if( code === 40 || code === 83 ){ $.keys.state.down = 1; }
	if( code === 37 || code === 65 ){ $.keys.state.left = 1; }
	if( code === 32 ){ $.mouse.down = 1; } // Space to shoot
	if( code === 70 ){ $.keys.state.f = 1; }
	if( code === 77 ){ $.keys.state.m = 1; }
	if( code === 80 ){ $.keys.state.p = 1; }
}

$.keyupcb = function( e ) {
	if ( $.mode === 'ai' ) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}
	var code = ( e.keyCode ? e.keyCode : e.which );
	if( code === 38 || code === 87 ){ $.keys.state.up = 0; }
	if( code === 39 || code === 68 ){ $.keys.state.right = 0; }
	if( code === 40 || code === 83 ){ $.keys.state.down = 0; }
	if( code === 37 || code === 65 ){ $.keys.state.left = 0; }
	if( code === 32 ){ $.mouse.down = 0; } // Space to stop shooting
	if( code === 70 ){ $.keys.state.f = 0; }
	if( code === 77 ){ $.keys.state.m = 0; }
	if( code === 80 ){ $.keys.state.p = 0; }
}

$.resizecb = function( e ) {
	var rect = $.cmg.getBoundingClientRect();
	$.cOffset = {
		left: rect.left,
		top: rect.top
	}
}

$.blurcb = function() {
	if( $.state == 'play' && window.parent === window ){
		$.setState( 'pause' );
	}
}

$.bindEvents = function() {
	window.addEventListener( 'mousemove', $.mousemovecb );
	window.addEventListener( 'mousedown', $.mousedowncb );
	window.addEventListener( 'mouseup', $.mouseupcb );
	window.addEventListener( 'keydown', $.keydowncb );
	window.addEventListener( 'keyup', $.keyupcb );
	window.addEventListener( 'resize', $.resizecb );
	window.addEventListener( 'blur', $.blurcb );
};

/*==============================================================================
Miscellaneous
==============================================================================*/
$.clearScreen = function() {
	$.ctxmg.clearRect( 0, 0, $.cw, $.ch );
};

$.updateDelta = function() { 
	var now = Date.now();
	$.dt = ( now - $.lt ) / ( 1000 / 60 );
	$.dt = ( $.dt < 0 ) ? 0.001 : $.dt;
	$.dt = ( $.dt > 10 ) ? 10 : $.dt;
	$.lt = now;
	$.elapsed += $.dt;
};

$.updateScreen = function() {
	var xSnap,
		xModify, 
		ySnap,
		yModify;

	if( $.hero.x < $.cw / 2 ) {
		xModify = $.hero.x / $.cw;
	} else if( $.hero.x > $.ww - $.cw / 2 ) {
		xModify = 1 - ( $.ww - $.hero.x ) / $.cw;
	} else {
		xModify = 0.5;		
	}

	if( $.hero.y < $.ch / 2 ) {
		yModify = $.hero.y / $.ch;
	} else if( $.hero.y > $.wh - $.ch / 2 ) {
		yModify = 1 - ( $.wh - $.hero.y ) / $.ch;
	} else {
		yModify = 0.5;		
	}

	xSnap = ( ( $.cw * xModify - $.hero.x ) - $.screen.x ) / 30;
	ySnap = ( ( $.ch * yModify - $.hero.y ) - $.screen.y ) / 30;	

	// ease to new coordinates
	$.screen.x += xSnap * $.dt;
	$.screen.y += ySnap * $.dt;

	// update rumble levels disabled for performance
	$.rumble.x = 0;
	$.rumble.y = 0;

	//$.screen.x -= $.rumble.x;
	//$.screen.y -= $.rumble.y;

	// animate background canvases with hardware acceleration (translate3d)
	var xMod = ( ( -$.screen.x - ( $.ww - $.cw ) / 2 ) / ( ( $.ww - $.cw ) / 2) );
	var yMod = ( ( -$.screen.y - ( $.wh - $.ch ) / 2 ) / ( ( $.wh - $.ch ) / 2) );

	var layers = [$.cbg1, $.cbg2, $.cbg3, $.cbg4];
	for( var i = 0; i < layers.length; i++ ) {
		var layer = layers[ i ];
		var dx = -( ( layer.width - $.cw ) / 2 );
		var dy = -( ( layer.height - $.ch ) / 2 );
		var x = dx + dx * xMod - $.rumble.x;
		var y = dy + dy * yMod - $.rumble.y;
		layer.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
	}

	$.mousescreen();
};

$.updateLevel = function() {
	if( $.level.kills >= $.level.killsToLevel ) {
		if( $.level.current + 1 < $.levelCount ){
			$.level.current++;
			$.level.kills = 0;
			$.level.killsToLevel = $.definitions.levels[ $.level.current ].killsToLevel;
			$.level.distribution = $.definitions.levels[ $.level.current ].distribution;
			$.level.distributionCount = $.level.distribution.length;
		} else {
			$.level.current++;
			$.level.kills = 0;
			// no more level definitions, so take the last level and increase the spawn rate slightly
			//for( var i = 0; i < $.level.distributionCount; i++ ) {
				//$.level.distribution[ i ] = Math.max( 1, $.level.distribution[ i ] - 5 );
			//}
		}
		$.levelDiffOffset = $.level.current + 1 - $.levelCount;
		$.levelPops.push( new $.LevelPop( {
			level: $.level.current + 1
		} ) );
	}
};

$.updatePowerupTimers = function() {
	// HEALTH
	if( $.powerupTimers[ 0 ] > 0 ){
		if( $.hero.life < 1 ) {
			$.hero.life += 0.001;
		}
		if( $.hero.life > 1 ) {
			$.hero.life = 1;
		}
		$.powerupTimers[ 0 ] -= $.dt;
	}

	// SLOW ENEMIES
	if( $.powerupTimers[ 1 ] > 0 ){
		$.slow = 1;
		$.powerupTimers[ 1 ] -= $.dt;
	} else {
		$.slow = 0;
	}

	// FAST SHOT
	if( $.powerupTimers[ 2 ] > 0 ){
		$.hero.weapon.fireRate = 2;
		$.hero.weapon.bullet.speed = 14;
		$.powerupTimers[ 2 ] -= $.dt;
	} else {
		$.hero.weapon.fireRate = 5;
		$.hero.weapon.bullet.speed = 10;
	}

	// TRIPLE SHOT
	if( $.powerupTimers[ 3 ] > 0 ){
		$.hero.weapon.count = 3;
		$.powerupTimers[ 3 ] -= $.dt;
	} else {
		$.hero.weapon.count = 1;
	}

	// PIERCE SHOT
	if( $.powerupTimers[ 4 ] > 0 ){
		$.hero.weapon.bullet.piercing = 1;
		$.powerupTimers[ 4 ] -= $.dt;
	} else {
		$.hero.weapon.bullet.piercing = 0;
	}
};	

$.spawnPowerup = function( x, y ) {
	if( Math.random() < 0.1 ) {
		var min = ( $.hero.life < 0.9 ) ? 0 : 1,
			type = Math.floor( $.util.rand( min, $.definitions.powerups.length ) ),
			params = $.definitions.powerups[ type ];
		params.type = type;
		params.x = x;
		params.y = y;
		$.powerups.push( new $.Powerup( params ) );
	}
};

/*==============================================================================
States
==============================================================================*/
$.setState = function( state ) {
	// handle clean up between states
	$.buttons.length = 0;

	if( state == 'menu' ) {
		$.mouse.down = 0;		
		$.mouse.ax = 0;
		$.mouse.ay = 0;
		$.reset();
		// Canvas buttons removed - handled by HTML overlay in index.html
	}

	// stats state removed - handled by HTML overlay removal in index.html

	if( state == 'credits' ) {
		$.mouse.down = 0;

		var js13kButton = new $.Button( {
			x: $.cw / 2 + 1,
			y: 476,
			lockedWidth: 299,
			lockedHeight: 49,
			scale: 3,
			title: 'JS13KGAMES',
			action: function() {				
				location.href = 'http://js13kgames.com';
				$.mouse.down = 0;
			}
		} );
		$.buttons.push( js13kButton );

		var menuButton = new $.Button( {
			x: $.cw / 2 + 1,
			y: js13kButton.ey + 25,
			lockedWidth: 299,
			lockedHeight: 49,
			scale: 3,
			title: 'MENU',
			action: function() {
				$.setState( 'menu' );
			}
		} );
		$.buttons.push( menuButton );	
	}

	if( state == 'pause' ) {
		$.mouse.down = 0;
		$.screenshot = $.ctxmg.getImageData( 0, 0, $.cw, $.ch );
		// Canvas buttons removed - handled by HTML HUD in index.html
	}

	if( state == 'gameover' ) {
		$.mouse.down = 0;
		$.screenshot = $.ctxmg.getImageData( 0, 0, $.cw, $.ch );
		// Canvas buttons removed - handled by HTML HUD in index.html

		$.storage['score'] = Math.max( $.storage['score'], $.score );
		$.storage['level'] = Math.max( $.storage['level'], $.level.current );		
		$.storage['rounds'] += 1;
		$.storage['kills'] += $.kills;
		$.storage['bullets'] += $.bulletsFired;
		$.storage['powerups'] += $.powerupsCollected;		
		$.storage['time'] += Math.floor( $.elapsed );
		$.updateStorage();
	}

	// set state
	$.state = state;
};

$.setupStates = function() {
	$.states['menu'] = function() {
		$.clearScreen();
		$.updateScreen();

		var i = $.buttons.length; while( i-- ){ $.buttons[ i ].update( i ) }
			i = $.buttons.length; while( i-- ){ $.buttons[ i ].render( i ) }

		$.ctxmg.save();
		$.ctxmg.font = "bold 80px 'Courier New', Courier, monospace";
		$.ctxmg.textBaseline = "bottom";
		$.ctxmg.textAlign = "center";
		$.ctxmg.fillStyle = 'hsla(180, 100%, 60%, 1)';
		$.ctxmg.shadowBlur = 30;
		$.ctxmg.shadowColor = 'hsla(180, 100%, 50%, 1)';
		$.ctxmg.fillText('TARGET ZERO', $.cw / 2, $.ch / 2 - 100);
		$.ctxmg.restore();



	};

	// $.states['stats'] removed - feature deleted as requested
	
	$.states['play'] = function() {
		$.updateDelta();
		$.updateScreen();
		$.updateLevel();
		$.updatePowerupTimers();
		$.spawnEnemies();
		$.enemyOffsetMod += ( $.slow ) ? $.dt / 3 : $.dt;
		
		// update entities	
		var i = $.enemies.length; while( i-- ){ $.enemies[ i ].update( i ) }
			i = $.explosions.length; while( i-- ){ $.explosions[ i ].update( i ) }
			i = $.powerups.length; while( i-- ){ $.powerups[ i ].update( i ) }
			i = $.particleEmitters.length; while( i-- ){ $.particleEmitters[ i ].update( i ) }
			i = $.textPops.length; while( i-- ){ $.textPops[ i ].update( i ) }
			i = $.levelPops.length; while( i-- ){ $.levelPops[ i ].update( i ) }
			i = $.bullets.length; while( i-- ){ $.bullets[ i ].update( i ) }
		$.hero.update();

		// render entities
		$.clearScreen();
		$.ctxmg.save();
		$.ctxmg.translate( $.screen.x - $.rumble.x, $.screen.y - $.rumble.y );
		i = $.enemies.length; while( i-- ){ $.enemies[ i ].render( i ) }
		i = $.explosions.length; while( i-- ){ $.explosions[ i ].render( i ) }
		i = $.powerups.length; while( i-- ){ $.powerups[ i ].render( i ) }
		i = $.particleEmitters.length; while( i-- ){ $.particleEmitters[ i ].render( i ) }
		i = $.textPops.length; while( i-- ){ $.textPops[ i ].render( i ) }		
		i = $.bullets.length; while( i-- ){ $.bullets[ i ].render( i ) }
		$.hero.render();		
		$.ctxmg.restore();		
		i = $.levelPops.length; while( i-- ){ $.levelPops[ i ].render( i ) }
		$.renderInterface();
		$.renderMinimap();

		// handle gameover
		if( $.hero.life <= 0 ) {
			var alpha = ( ( $.gameoverTick / $.gameoverTickMax ) * 0.8 );
				alpha = Math.min( 1, Math.max( 0, alpha ) );
			$.ctxmg.fillStyle = 'hsla(0, 100%, 0%, ' + alpha + ')';
			$.ctxmg.fillRect( 0, 0, $.cw, $.ch );
			if( $.gameoverTick < $.gameoverTickMax ){				
				$.gameoverTick += $.dt;				
			} else {
				$.setState( 'gameover' );
			}

			if( !$.gameoverExplosion ) {
				$.audio.play( 'death' );
				$.rumble.level = 25;
				$.explosions.push( new $.Explosion( {
					x: $.hero.x + $.util.rand( -10, 10 ),
					y: $.hero.y + $.util.rand( -10, 10 ),
					radius: 50,
					hue: 0,
					saturation: 0
				} ) );
				$.particleEmitters.push( new $.ParticleEmitter( {
					x: $.hero.x,
					y: $.hero.y,
					count: 45,
					spawnRange: 10,
					friction: 0.95,
					minSpeed: 2,
					maxSpeed: 20,
					minDirection: 0,
					maxDirection: $.twopi,
					hue: 0,
					saturation: 0
				} ) );
				for( var i = 0; i < $.powerupTimers.length; i++ ){
					$.powerupTimers[ i ] = 0;
				}
				$.gameoverExplosion = 1;
			}		
		}

		// update tick	
		$.tick += $.dt;	

		// listen for pause
		if( $.keys.pressed.p ){
			$.setState( 'pause' );
		}

		// always listen for autofire toggle
		if( $.keys.pressed.f ){
			$.autofire = ~~!$.autofire;			
			$.storage['autofire'] = $.autofire;
			$.updateStorage();
		}
	};

	$.states['pause'] = function() {
		$.clearScreen();
		$.ctxmg.putImageData( $.screenshot, 0, 0 );

		$.ctxmg.fillStyle = 'hsla(0, 0%, 0%, 0.4)';
		$.ctxmg.fillRect( 0, 0, $.cw, $.ch );

		$.ctxmg.save();
		$.ctxmg.font = "bold 80px 'Courier New', Courier, monospace";
		$.ctxmg.textBaseline = "bottom";
		$.ctxmg.textAlign = "center";
		$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 1)';
		$.ctxmg.shadowBlur = 20;
		$.ctxmg.shadowColor = 'hsla(0, 0%, 100%, 0.5)';
		$.ctxmg.fillText('PAUSED', $.cw / 2, $.ch / 2 - 50);
		$.ctxmg.restore();

		var i = $.buttons.length; while( i-- ){ $.buttons[ i ].render( i ) }
			i = $.buttons.length; while( i-- ){ $.buttons[ i ].update( i ) }

		if( $.keys.pressed.p ){
			$.setState( 'play' );
		}
	};

	$.states['gameover'] = function() {
		$.clearScreen();
		$.ctxmg.putImageData( $.screenshot, 0, 0 );

		var i = $.buttons.length; while( i-- ){ $.buttons[ i ].update( i ) }
			i = $.buttons.length; while( i-- ){ $.buttons[ i ].render( i ) }

		$.ctxmg.save();
		$.ctxmg.font = "bold 80px 'Courier New', Courier, monospace";
		$.ctxmg.textBaseline = "bottom";
		$.ctxmg.textAlign = "center";
		$.ctxmg.fillStyle = 'hsla(0, 100%, 50%, 1)';
		$.ctxmg.shadowBlur = 30;
		$.ctxmg.shadowColor = 'hsla(0, 100%, 40%, 1)';
		$.ctxmg.fillText('GAME OVER', $.cw / 2, 150);

		$.ctxmg.font = "bold 20px 'Courier New', Courier, monospace";
		$.ctxmg.textBaseline = "top";
		$.ctxmg.textAlign = "right";
		$.ctxmg.fillStyle = 'hsla(0, 0%, 100%, 0.5)';
		$.ctxmg.shadowBlur = 0;
		
		var labels = ['SCORE', 'LEVEL', 'KILLS', 'BULLETS', 'POWERUPS', 'TIME'];
		for(var k=0; k<labels.length; k++) {
			$.ctxmg.fillText(labels[k], $.cw / 2 - 10, 200 + (k * 25));
		}

		$.ctxmg.textAlign = "left";
		$.ctxmg.fillStyle = '#fff';
		var values = [
			$.util.commas( $.score ),
			( $.level.current + 1 ),
			$.util.commas( $.kills ),
			$.util.commas( $.bulletsFired ),
			$.util.commas( $.powerupsCollected ),
			$.util.convertTime( ( $.elapsed * ( 1000 / 60 ) ) / 1000 )
		];
		for(var k=0; k<values.length; k++) {
			$.ctxmg.fillText(values[k], $.cw / 2 + 10, 200 + (k * 25));
		}
		$.ctxmg.restore();
	};
}

/*==============================================================================
Loop
==============================================================================*/
$.loop = function() {
	requestAnimFrame( $.loop );

	// setup the pressed state for all keys
	for( var k in $.keys.state ) {
		if( $.keys.state[ k ] && !$.okeys[ k ] ) {
			$.keys.pressed[ k ] = 1;
		} else {
			$.keys.pressed[ k ] = 0;
		}
	}

	// run the current state
	$.states[ $.state ]();

	// always listen for mute toggle
	if( $.keys.pressed.m ){
		$.mute = ~~!$.mute;
		var i = $.audio.references.length;
		while( i-- ) {
			$.audio.references[ i ].volume = ~~!$.mute;
		}
		$.storage['mute'] = $.mute;
		$.updateStorage();
	}

	// move current keys into old keys
	$.okeys = {};
	for( var k in $.keys.state ) {
		$.okeys[ k ] = $.keys.state[ k ];
	}
};

/*==============================================================================
Start Game on Load
==============================================================================*/
// Init on load handled by individual pages (index.html / duel.html)
window.addEventListener( 'load', function() {
	document.documentElement.className += ' loaded';
	// $.init(); // Removed duplicate call to prevent dual-loop crashes
});

// Global Message Listener for Duel Commands
window.addEventListener('message', (event) => {
	const data = event.data;
	if (data.type === 'command') {
		console.log('Global command received in frame ('+$.mode+'):', data.action);
		if (data.action === 'start') {
			$.isDuelStarted = true;
			$.reset();
			$.setState('play');
			if ($.mode === 'human') window.focus();
		}
		if (data.action === 'pause') {
			console.log('Pause command received');
			$.setState('pause');
		}
		if (data.action === 'resume') {
			console.log('Resume command received');
			$.lt = Date.now() + 1000;
			$.setState('play');
		}
		if (data.action === 'autofire') {
			$.autofire = data.value ? 1 : 0;
		}
	}
});