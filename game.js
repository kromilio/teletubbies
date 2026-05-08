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
// sliceY is 1 because your file only has one row!
loadSprite("run_dust", "Walk_Run_Push_Dust_6.png", { 
    sliceX: 6, 
    sliceY: 1, 
    anims: { "poof": { from: 0, to: 5 } } 
})
loadSprite("jump_dust", "Double_Jump_Dust_5.png", { 
    sliceX: 5, 
    sliceY: 1,
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
        pos(position.x, position.y + 16), // Adjusted to be right under feet
        anchor("center"),
        scale(2),
        lifespan(0.2),
        z(-1), 
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
    anchor("center"), // This is key for flipping correctly
    scale(2),
    { 
        canDoubleJump: false,
        facingLeft: false // This saves the direction even when idle
    }
])

// --- CORE LOOP ---
onUpdate(() => {
    const sprinting = isKeyDown("shift")
    const currentSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED
    const left = isKeyDown("a")
    const right = isKeyDown("d")

    // 1. DIRECTION & MOVEMENT
    if (left && !right) {
        player.move(-currentSpeed, 0)
        player.facingLeft = true
    } else if (right && !left) {
        player.move(currentSpeed, 0)
        player.facingLeft = false
    }
    
    // Always apply the flip based on the last direction moved
    player.flipX = player.facingLeft

    // 2. SPRINT DUST
    if (player.isGrounded() && (left || right) && sprinting) {
        if (frameCount() % 10 === 0) {
            addDust("run_dust", player.pos, player.flipX)
        }
    }

    // 3. ANIMATION STATE MACHINE
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
        addDust("jump_dust", player.pos, player.flipX)
    } else if (player.canDoubleJump) {
        player.jump(JUMP_FORCE * 0.8)
        player.canDoubleJump = false
        addDust("jump_dust", player.pos, player.flipX)
    }
})

onUpdate(() => {
    camPos(player.pos.x, height() / 2)
})
