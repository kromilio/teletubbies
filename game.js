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

// --- LOAD BACKGROUND ---
loadSprite("bg", "windrise-background.png")

// --- CONSTANTS ---
const WALK_SPEED = 300
const SPRINT_SPEED = 600
const JUMP_FORCE = 650
setGravity(2200)

// --- BACKGROUND ---
const bg = add([
    sprite("bg"),
    pos(0, 0),
    fixed(),
    z(-10),
    scale(1), // bump up to 2 if it looks too small vertically
])

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

// --- CAMERA + BACKGROUND SCROLL ---
onUpdate(() => {
    camPos(player.pos)

    // Fake parallax: background drifts slowly opposite the camera
    // factor 0 = locked to camera, 1 = locked to world. 0.3 feels nice.
    bg.pos.x = -((player.pos.x * 0.3) % bg.width)
    bg.pos.y = height() - bg.height
})
