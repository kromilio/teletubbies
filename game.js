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
const WORLD_WIDTH = width() * 20
const FLOOR_HEIGHT = 48
setGravity(2200)

// --- BACKGROUND ---
// Tile across the world, sized to leave room for the floor at the bottom.
const BG_TILE_HEIGHT = height() - FLOOR_HEIGHT
const BG_TILE_WIDTH = BG_TILE_HEIGHT * (1920 / 720)

for (let x = 0; x < WORLD_WIDTH; x += BG_TILE_WIDTH) {
    add([
        sprite("bg", { width: BG_TILE_WIDTH, height: BG_TILE_HEIGHT }),
        pos(x, 0),
        z(-10),
    ])
}

// --- WORLD (floor) ---
add([
    rect(WORLD_WIDTH, FLOOR_HEIGHT),
    pos(0, height() - FLOOR_HEIGHT),
    area(),
    body({ isStatic: true }),
    color(180, 180, 180),
])

// --- PLAYER ---
const player = add([
    sprite("monster_idle", { anim: "idle" }),
    pos(WORLD_WIDTH / 2, height() - FLOOR_HEIGHT - 100), // spawn in the middle, just above floor
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

// --- CAMERA ---
// Follow the player horizontally only — Y stays locked so the floor is
// always at the bottom of the screen.
onUpdate(() => {
    camPos(player.pos.x, height() / 2)
})
