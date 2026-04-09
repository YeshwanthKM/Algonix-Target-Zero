/*==============================================================================
Refined AI Controller for Target Zero - v2
==============================================================================*/

(function() {
    console.log('AI Controller v2 Active');

    // Create a small badge to indicate AI is active
    const badge = document.createElement('div');
    badge.style.position = 'fixed';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.background = 'rgba(0, 255, 255, 0.7)';
    badge.style.color = '#000';
    badge.style.padding = '5px 10px';
    badge.style.fontFamily = 'monospace';
    badge.style.fontSize = '12px';
    badge.style.zIndex = '1000';
    badge.innerText = 'AUTO-ALGORITHM ACTIVE';
    document.body.appendChild(badge);

    function updateAI() {
        // Only run when in 'play' state and hero is alive
        if (!window.$ || $.state !== 'play' || !$.hero || $.hero.life <= 0) {
            requestAnimationFrame(updateAI);
            return;
        }

        // Force autofire and fire flag
        $.autofire = 1;
        $.mouse.down = 1;

        // 1. Target Detection
        let target = null;
        let minDist = Infinity;

        if ($.enemies && $.enemies.length > 0) {
            for (let i = 0; i < $.enemies.length; i++) {
                const enemy = $.enemies[i];
                if (!enemy) continue;
                const d = $.util.distance($.hero.x, $.hero.y, enemy.x, enemy.y);
                if (d < minDist) {
                    minDist = d;
                    target = enemy;
                }
            }
        }

        // 2. Aiming Logic
        if (target) {
            // Direct coordinate injection
            $.mouse.x = target.x;
            $.mouse.y = target.y;

            // 3. Movement Logic
            const dx = target.x - $.hero.x;
            const dy = target.y - $.hero.y;

            // Reset keys
            $.keys.state.up = $.keys.state.down = $.keys.state.left = $.keys.state.right = 0;

            if (minDist < 120) {
                // Too close! Retreat
                if (dy > 0) $.keys.state.up = 1;
                else if (dy < 0) $.keys.state.down = 1;
                
                if (dx > 0) $.keys.state.left = 1;
                else if (dx < 0) $.keys.state.right = 1;
            } else if (minDist > 300) {
                // Too far! Close in
                if (dy > 10) $.keys.state.down = 1;
                else if (dy < -10) $.keys.state.up = 1;

                if (dx > 10) $.keys.state.right = 1;
                else if (dx < -10) $.keys.state.left = 1;
            } else {
                // Optimal range: Strafe for evasion
                const strafe = Math.sin(Date.now() / 200);
                if (strafe > 0.4) $.keys.state.left = 1;
                if (strafe < -0.4) $.keys.state.right = 1;
                
                // Slowly oscillate y
                if (Math.cos(Date.now() / 300) > 0) $.keys.state.up = 1;
                else $.keys.state.down = 1;
            }
        } else {
            // Idle movement: head to center
            const centerX = $.ww / 2;
            const centerY = $.wh / 2;
            const dcenterX = centerX - $.hero.x;
            const dcenterY = centerY - $.hero.y;

            $.keys.state.up = dcenterY < -30 ? 1 : 0;
            $.keys.state.down = dcenterY > 30 ? 1 : 0;
            $.keys.state.left = dcenterX < -30 ? 1 : 0;
            $.keys.state.right = dcenterX > 30 ? 1 : 0;
            
            // Still aim somewhere
            $.mouse.x = centerX;
            $.mouse.y = centerY;
        }

        // Check for powerups nearby
        if ($.powerups && $.powerups.length > 0) {
            for (let i = 0; i < $.powerups.length; i++) {
                const p = $.powerups[i];
                const dist = $.util.distance($.hero.x, $.hero.y, p.x, p.y);
                if (dist < 400) {
                    // Pull towards powerup
                    const pdx = p.x - $.hero.x;
                    const pdy = p.y - $.hero.y;
                    if (pdy > 20) $.keys.state.down = 1;
                    if (pdy < -20) $.keys.state.up = 1;
                    if (pdx > 20) $.keys.state.right = 1;
                    if (pdx < -20) $.keys.state.left = 1;
                    break;
                }
            }
        }

        requestAnimationFrame(updateAI);
    }

    requestAnimationFrame(updateAI);
})();
