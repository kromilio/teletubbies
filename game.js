import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs"

kaboom({
    background: [30, 30, 30],
})

// --- LOAD SPRITES ---
loadSprite("monster_idle", "Pink_Monster_Idle_4.png", {
    sliceX: 4, anims: { "idle": { from: 0, to: 3, loop: true } }
})
loadSprite("monster_walk", "Pink_Monster_Walk_6.png", {
    sliceX: 6, anims: { "walk": { from: 0, to: 5, loop: true } }
})
loadSprite("monster_run", "Pink_Monster_Run_6.png", {
    sliceX: 6, anims: { "run": { from: 0, to: 5, loop: true } }
})
loadSprite("monster_jump", "Pink_Monster_Jump_8.png", {
    sliceX: 8, anims: { "jump": { from: 0, to: 7 } }
})

// --- BACKGROUND LAYERS (parallax) ---
// Replace these URLs with your own images later. For now, use solid color layers
// to give a sense of depth. Drop in a sky/mountain/foreground PNG when you have one.
loadSprite("bg_sky", "background_sky.png")        // far layer (slow)
loadSprite("bg_mid", "background_mid.png")        // mid layer
loadSprite("bg_near", "background_near.png")      // near layer (fastest)

// --- CONSTANTS ---
const WALK_SPEED = 300
const SPRINT_SPEED = 600
const JUMP_FORCE = 650          // reduced so it matches the 8-frame jump anim
setGravity(2200)                // slightly lower gravity, smoother arc

// --- PARALLAX BACKGROUND ---
// Each layer scrolls based on the camera position * a factor (< 1 = farther away).
const bgLayers = [
    { sprite: "bg_sky",  factor: 0.1 },
    { sprite: "bg_mid",  factor: 0.4 },
    { sprite: "bg_near", factor: 0.7 },
]

const bgObjects = bgLayers.map(layer =>
    add([
        sprite(layer.sprite, { width: width(), height: height() }),
        pos(0, 0),
        fixed(),       // ignore camera (we'll move them manually)
        z(-10),        // behind everything
        "bg",
        { factor: layer.factor },
    ])
)

// --- PLAYER ---
const player = add([
    sprite("monster_idle", { anim: "idle" }),
    pos(100, 100),
    area(),
    body(),
    scale(2),
    {
        facingLeft: false,   // remembers facing direction
    },
])

// --- CORE LOGIC ---
onUpdate(() => {
    // 1. Determine Speed
    const sprinting = isKeyDown("shift")
    const currentSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED

    // 2. Horizontal Movement (A and D)
    const leftDown = isKeyDown("a")
    const rightDown = isKeyDown("d")

    if (leftDown && !rightDown) {
        player.move(-currentSpeed, 0)
        player.facingLeft = true
    } else if (rightDown && !leftDown) {
        player.move(currentSpeed, 0)
        player.facingLeft = false
    }
    // Apply facing every frame so it sticks even when idle / jumping
    player.flipX = player.facingLeft

    // 3. Animation State Machine
    if (!player.isGrounded()) {
        // JUMPING ANIMATION
        if (player.curAnim() !== "jump") {
            player.use(sprite("monster_jump"))
            player.play("jump")
        }
    } else {
        const moving = leftDown || rightDown
        if (moving) {
            if (sprinting) {
                // RUN
                if (player.curAnim() !== "run") {
                    player.use(sprite("monster_run"))
                    player.play("run")
                }
                player.animSpeed = 1.2
            } else {
                // WALK
                if (player.curAnim() !== "walk") {
                    player.use(sprite("monster_walk"))
                    player.play("walk")
                }
                player.animSpeed = 1
            }
        } else {
            // IDLE
            if (player.curAnim() !== "idle") {
                player.use(sprite("monster_idle"))
                player.play("idle")
            }
            player.animSpeed = 1
        }
    }
})

// --- JUMP ACTION ---
onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump(JUMP_FORCE)
    }
})

// --- WORLD ---
add([
    rect(width() * 20, 48),
    pos(0, height() - 48),
    area(),
    body({ isStatic: true }),
    color(100, 100, 100),
])

// --- CAMERA + PARALLAX UPDATE ---
onUpdate(() => {
    camPos(player.pos)

    // Move each background layer opposite to the camera, scaled by its factor.
    // factor 0 = stuck to camera (no parallax), factor 1 = moves with world.
    bgObjects.forEach(bg => {
        bg.pos.x = player.pos.x - width() / 2 - (player.pos.x * bg.factor) % width()
        bg.pos.y = 0
    })
})
