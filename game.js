import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs"

kaboom({
    background: [30, 30, 30],
    width: 1280,
    height: 480,
    letterbox: true,
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
    sprite("bg", { width: width(), height: height() }),
    pos(0, 0),
    fixed(),
    z(-10),
])

// --- PLAYER ---
const player = add([
    sprite("monster_idle", { anim: "idle" }),
    pos(100, 100),
    area(),
    body(),
    scale(2),
    {
        facingLeft: false,
    },
])

// --- CORE LOGIC ---
onUpdate(() => {
    const sprinting = isKeyDown("shift")
    const currentSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED

    const leftDown = isKeyDown("a")
    const rightDown = isKeyDown("d")

    if (leftDown && !rightDown) {
        player.move(-currentSpeed, 0)
        player.facingLeft = true
    } else if (rightDown && !leftDown) {
        player.move(currentSpeed, 0)
        player.facingLeft = false
    }
    player.flipX = player.facingLeft

    // Animation State Machine
    if (!player.isGrounded()) {
        if (player.curAnim() !== "jump") {
            player.use(sprite("monster_jump"))
            player.play("jump")
        }
    } else {
        const moving = leftDown || rightDown
        if (moving) {
            if (sprinting) {
                if (player.curAnim() !== "run") {
                    player.use(sprite("monster_run"))
                    player.play("run")
                }
                player.animSpeed = 1.2
            } else {
                if (player.curAnim() !== "walk") {
                    player.use(sprite("monster_walk"))
                    player.play("walk")
                }
                player.animSpeed = 1
            }
        } else {
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

    bg.pos.x = -((player.pos.x * 0.3) % bg.width)
})
