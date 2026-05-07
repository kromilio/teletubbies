import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs"

kaboom({
    background: [30, 30, 30],
})

// --- LOAD SPRITES ---
loadSprite("monster_idle", "Pink_Monster_Idle_4.png", {
    sliceX: 4, anims: { "idle": { from: 0, to: 3, loop: true } }
})

loadSprite("monster_run", "Pink_Monster_Run_6.png", {
    sliceX: 6, anims: { "run": { from: 0, to: 5, loop: true } }
})

// Make sure the filename matches your jump strip!
loadSprite("monster_jump", "Pink_Monster_Jump_8.png", {
    sliceX: 8, anims: { "jump": { from: 0, to: 7 } }
})

// --- CONSTANTS ---
const WALK_SPEED = 300
const SPRINT_SPEED = 600
const JUMP_FORCE = 900

setGravity(2600)

// --- PLAYER ---
const player = add([
    sprite("monster_idle", { anim: "idle" }),
    pos(100, 100),
    area(),
    body(),
    scale(2),
])

// --- CORE LOGIC ---
onUpdate(() => {
    // 1. Determine Speed
    let currentSpeed = isKeyDown("shift") ? SPRINT_SPEED : WALK_SPEED

    // 2. Horizontal Movement (A and D)
    if (isKeyDown("a")) {
        player.move(-currentSpeed, 0)
        player.flipX = true
    } else if (isKeyDown("d")) {
        player.move(currentSpeed, 0)
        player.flipX = false
    }

    // 3. Animation State Machine
    if (!player.isGrounded()) {
        // JUMPING ANIMATION
        if (player.curAnim() !== "jump") {
            player.use(sprite("monster_jump"))
            player.play("jump")
        }
    } else {
        if (isKeyDown("a") || isKeyDown("d")) {
            // RUNNING/WALKING ANIMATION
            if (player.curAnim() !== "run") {
                player.use(sprite("monster_run"))
                player.play("run")
            }
            // Optional: Make animation faster when sprinting
            player.animSpeed = isKeyDown("shift") ? 1.5 : 1
        } else {
            // IDLE ANIMATION (Reset when still)
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

onUpdate(() => {
    camPos(player.pos)
})
