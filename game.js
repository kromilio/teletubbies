import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs"

kaboom({
    background: [30, 30, 30],
    width: 1280,
    height: 480,
    letterbox: true,
})

// --- LOAD PLAYER ---
loadSprite("monster_idle", "Pink_Monster_Idle_4.png", { sliceX: 4, anims: { "idle": { from: 0, to: 3, loop: true } } })
loadSprite("monster_walk", "Pink_Monster_Walk_6.png", { sliceX: 6, anims: { "walk": { from: 0, to: 5, loop: true } } })
loadSprite("monster_run", "Pink_Monster_Run_6.png", { sliceX: 6, anims: { "run": { from: 0, to: 5, loop: true } } })
loadSprite("monster_jump", "Pink_Monster_Jump_8.png", { sliceX: 8, anims: { "jump": { from: 0, to: 7 } } })

// --- LOAD DUST ---
// If the screen still turns black, change sliceY to 2 or 3!
loadSprite("run_dust", "Walk_Run_Push_Dust_6.png", { 
    sliceX: 6, 
    sliceY: 1, 
    anims: { "poof": { from: 0, to: 5 } } 
})
loadSprite("jump_dust", "Double_Jump_Dust_5.png", { 
    sliceX: 5, 
    anims: { "poof": { from: 0, to: 4 } } 
})

loadSprite("bg", "windrise-background.png")

const WALK_SPEED = 300
const SPRINT_SPEED = 600
const JUMP_FORCE = 750
setGravity(2200)

// --- DUST SPAWNER ---
function addDust(type, position, flipped) {
    add([
        sprite(type, { anim: "poof", flipX: flipped }),
        pos(position),
        anchor("bot"),
        scale(2),
        lifespan(0.2),
    ])
}

// --- WORLD ---
add([
    rect(width() * 20, 48),
    pos(0, height() - 48),
    area(),
    body({ isStatic: true }),
    color(150, 150, 150),
])

// --- PLAYER ---
const player = add([
    sprite("monster_idle", { anim: "idle" }),
    pos(200, 300),
    area(),
    body(),
    scale(2),
    { 
        canDoubleJump: false,
        lastFlip: false // Store the direction here
    }
])

// --- CORE LOOP ---
onUpdate(() => {
    const sprinting = isKeyDown("shift")
    const currentSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED
    const left = isKeyDown("a")
    const right = isKeyDown("d")

    // DIRECTION LOGIC (The Twitch/Flip Fix)
    if (left && !right) {
        player.move(-currentSpeed, 0)
        player.lastFlip = true
    } else if (right && !left) {
        player.move(currentSpeed, 0)
        player.lastFlip = false
    }
    
    // Apply the saved flip state every frame
    player.flipX = player.lastFlip

    // SPRINT DUST LOGIC
    if (player.isGrounded() && (left || right) && sprinting) {
        if (frameCount() % 10 === 0) {
            // Spawn dust behind the monster
            const dustPos = player.pos.add(player.flipX ? 20 : -20, 20)
            addDust("run_dust", dustPos, player.flipX)
        }
    }

    // ANIMATION STATE MACHINE
    if (!player.isGrounded()) {
        if (player.curAnim() !== "jump") {
            player.use(sprite("monster_jump"))
            player.play("jump")
        }
    } else {
        player.canDoubleJump = true
        if (left || right) {
            const mode = sprinting ? "run" : "walk"
            const spr = sprinting ? "monster_run" : "monster_walk"
            if (player.curAnim() !== mode) {
                player.use(sprite(spr))
                player.play(mode)
            }
        } else {
            if (player.curAnim() !== "idle") {
                player.use(sprite("monster_idle"))
                player.play("idle")
            }
        }
    }
})

// --- JUMP ACTION ---
onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump(JUMP_FORCE)
        addDust("jump_dust", player.pos.add(0, 20), player.flipX)
    } else if (player.canDoubleJump) {
        player.jump(JUMP_FORCE * 0.8)
        player.canDoubleJump = false
        addDust("jump_dust", player.pos.add(0, 20), player.flipX)
    }
})

onUpdate(() => {
    camPos(player.pos.x, height() / 2)
})
