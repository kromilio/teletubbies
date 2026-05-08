import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs"

kaboom({
    background: [30, 30, 30],
    width: 1280,
    height: 480,
    letterbox: true,
})

// --- LOAD SPRITES ---
loadSprite("monster_idle", "Pink_Monster_Idle_4.png", { sliceX: 4, anims: { "idle": { from: 0, to: 3, loop: true } } })
loadSprite("monster_walk", "Pink_Monster_Walk_6.png", { sliceX: 6, anims: { "walk": { from: 0, to: 5, loop: true } } })
loadSprite("monster_run", "Pink_Monster_Run_6.png", { sliceX: 6, anims: { "run": { from: 0, to: 5, loop: true } } })
loadSprite("monster_jump", "Pink_Monster_Jump_8.png", { sliceX: 8, anims: { "jump": { from: 0, to: 7 } } })

// Only loads climb if you actually have the file. 
// If it still goes black, comment out the next line with //
loadSprite("monster_climb", "Pink_Monster_Climb_4.png", { sliceX: 4, anims: { "climb": { from: 0, to: 3, loop: true } } })

loadSprite("bg", "windrise-background.png")

const WALK_SPEED = 300
const SPRINT_SPEED = 600
const JUMP_FORCE = 750
const CLIMB_SPEED = 200
setGravity(2200)

// --- LEVEL DESIGN ---
const level = addLevel([
    "                                                     ",
    "          ====                                       ",
    "                                      ====           ",
    "    ====                ====                         ",
    "             |                                       ",
    "             |          ====                ====     ",
    "             |                                       ",
    "=====================================================",
], {
    tileWidth: 64,
    tileHeight: 64,
    tiles: {
        "=": () => [rect(64, 64), area(), body({ isStatic: true }), color(120, 120, 120), "platform"],
        "|": () => [rect(20, 64), area(), body({ isStatic: true }), color(80, 50, 20), "climbable"],
    }
})

// --- PLAYER ---
const player = add([
    sprite("monster_idle", { anim: "idle" }),
    pos(200, 300),
    area(),
    body(),
    scale(2),
    {
        canDoubleJump: false,
        isClimbing: false,
    },
])

// --- PARTICLES ---
function spawnDust(p, pColor = rgb(200, 200, 200)) {
    add([
        circle(rand(2, 5)),
        pos(p.x + (player.flipX ? 10 : -10), p.y + 18),
        color(pColor),
        move(UP, rand(20, 40)),
        opacity(1),
        lifespan(0.2),
    ])
}

// --- CORE LOGIC ---
onUpdate(() => {
    const sprinting = isKeyDown("shift")
    const currentSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED
    const leftDown = isKeyDown("a")
    const rightDown = isKeyDown("d")

    // TWITCH FIX: Only update flipX when moving
    if (leftDown && !rightDown) {
        player.move(-currentSpeed, 0)
        player.flipX = true
    } else if (rightDown && !leftDown) {
        player.move(currentSpeed, 0)
        player.flipX = false
    }

    // Climbing check
    const isTouchingWall = player.isColliding("climbable")
    if (isTouchingWall && isKeyDown("w")) {
        player.isClimbing = true
        player.move(0, -CLIMB_SPEED)
        if (player.curAnim() !== "climb") {
            player.use(sprite("monster_climb"))
            player.play("climb")
        }
    } else {
        player.isClimbing = false
    }

    // Animation Logic
    if (!player.isGrounded() && !player.isClimbing) {
        if (player.curAnim() !== "jump") {
            player.use(sprite("monster_jump"))
            player.play("jump")
        }
    } else if (player.isGrounded()) {
        player.canDoubleJump = true 
        if (leftDown || rightDown) {
            const anim = sprinting ? "run" : "walk"
            const spr = sprinting ? "monster_run" : "monster_walk"
            if (player.curAnim() !== anim) {
                player.use(sprite(spr))
                player.play(anim)
            }
            if (sprinting && frameCount() % 8 === 0) spawnDust(player.pos)
        } else {
            if (player.curAnim() !== "idle") {
                player.use(sprite("monster_idle"))
                player.play("idle")
            }
        }
    }
})

onKeyPress("space", () => {
    if (player.isGrounded()) {
        player.jump(JUMP_FORCE)
        spawnDust(player.pos)
    } else if (player.canDoubleJump) {
        player.jump(JUMP_FORCE * 0.8)
        player.canDoubleJump = false
        // Double jump "Cloud"
        for(let i=0; i<6; i++) spawnDust(player.pos, rgb(150, 200, 255))
    }
})

onUpdate(() => {
    camPos(player.pos.x, height() / 2)
})
