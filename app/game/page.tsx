'use client'

import React, { useRef, useEffect, useState } from 'react'

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const LEVEL_HEIGHT = 2000
const PLAYER_WIDTH = 30
const PLAYER_HEIGHT = 30
const GRAVITY = 0.5
const JUMP_FORCE = 13 // Slightly increased jump force
const MOVE_SPEED = 5

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  color: string
}

interface Player extends GameObject {
  velocityY: number
  isJumping: boolean
}

interface Spike extends GameObject {
  velocityX: number
}

export default function VerticalPlatformGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameWon, setGameWon] = useState(false)
  const [gameLost, setGameLost] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const player: Player = {
      x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
      y: LEVEL_HEIGHT - PLAYER_HEIGHT - 50,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      color: '#00F',
      velocityY: 0,
      isJumping: false,
    }

    const platforms: GameObject[] = [
      { x: 100, y: LEVEL_HEIGHT - 100, width: 200, height: 20, color: '#0F0' },
      { x: 400, y: LEVEL_HEIGHT - 250, width: 200, height: 20, color: '#0F0' },
      { x: 200, y: LEVEL_HEIGHT - 400, width: 200, height: 20, color: '#0F0' },
      { x: 500, y: LEVEL_HEIGHT - 550, width: 200, height: 20, color: '#0F0' },
      { x: 100, y: LEVEL_HEIGHT - 700, width: 200, height: 20, color: '#0F0' },
      { x: 400, y: LEVEL_HEIGHT - 850, width: 200, height: 20, color: '#0F0' },
      { x: 200, y: LEVEL_HEIGHT - 1000, width: 200, height: 20, color: '#0F0' },
      { x: 500, y: LEVEL_HEIGHT - 1150, width: 200, height: 20, color: '#0F0' },
      { x: 300, y: LEVEL_HEIGHT - 1300, width: 200, height: 20, color: '#0F0' },
      { x: 100, y: LEVEL_HEIGHT - 1450, width: 200, height: 20, color: '#0F0' },
    ]

    const goal: GameObject = {
      x: CANVAS_WIDTH / 2 - 20,
      y: LEVEL_HEIGHT - 1450 - 150,
      width: 40,
      height: 40,
      color: '#F00',
    }

    const spikes: Spike[] = [
      { x: 300, y: LEVEL_HEIGHT - 150, width: 30, height: 30, color: '#FF0', velocityX: 2 },
      { x: 100, y: LEVEL_HEIGHT - 450, width: 30, height: 30, color: '#FF0', velocityX: 3 },
      { x: 600, y: LEVEL_HEIGHT - 650, width: 30, height: 30, color: '#FF0', velocityX: 4 },
      { x: 200, y: LEVEL_HEIGHT - 900, width: 30, height: 30, color: '#FF0', velocityX: 3 },
      { x: 500, y: LEVEL_HEIGHT - 1100, width: 30, height: 30, color: '#FF0', velocityX: 5 },
    ]

    let leftPressed = false
    let rightPressed = false
    let spacePressed = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') leftPressed = true
      if (e.code === 'ArrowRight') rightPressed = true
      if (e.code === 'Space') spacePressed = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft') leftPressed = false
      if (e.code === 'ArrowRight') rightPressed = false
      if (e.code === 'Space') spacePressed = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const checkCollision = (obj1: GameObject, obj2: GameObject) => {
      return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
      )
    }

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Move player
      if (leftPressed) player.x -= MOVE_SPEED
      if (rightPressed) player.x += MOVE_SPEED

      // Handle jumping
      if (spacePressed && !player.isJumping) {
        player.velocityY = -JUMP_FORCE
        player.isJumping = true
      }

      // Apply gravity
      player.velocityY += GRAVITY
      player.y += player.velocityY

      // Check platform collisions
      let onPlatform = false
      for (const platform of platforms) {
        if (checkCollision(player, platform) && player.velocityY > 0) {
          player.y = platform.y - PLAYER_HEIGHT
          player.velocityY = 0
          player.isJumping = false
          onPlatform = true
          break
        }
      }

      // Reset jumping state if not on a platform
      if (!onPlatform) {
        player.isJumping = true
      }

      // Check boundaries
      if (player.x < 0) player.x = 0
      if (player.x + PLAYER_WIDTH > CANVAS_WIDTH) player.x = CANVAS_WIDTH - PLAYER_WIDTH
      if (player.y < 0) player.y = 0
      if (player.y + PLAYER_HEIGHT > LEVEL_HEIGHT) {
        player.y = LEVEL_HEIGHT - PLAYER_HEIGHT
        player.velocityY = 0
        player.isJumping = false
      }

      // Move spikes
      for (const spike of spikes) {
        spike.x += spike.velocityX
        if (spike.x <= 0 || spike.x + spike.width >= CANVAS_WIDTH) {
          spike.velocityX *= -1
        }

        // Check spike collision
        if (checkCollision(player, spike)) {
          setGameLost(true)
        }
      }

      // Check goal collision
      if (checkCollision(player, goal)) {
        setGameWon(true)
      }

      // Calculate camera offset
      const cameraY = Math.max(0, Math.min(LEVEL_HEIGHT - CANVAS_HEIGHT, player.y - CANVAS_HEIGHT / 2))

      // Draw objects
      ctx.save()
      ctx.translate(0, -cameraY)

      for (const platform of platforms) {
        ctx.fillStyle = platform.color
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
      }

      ctx.fillStyle = goal.color
      ctx.fillRect(goal.x, goal.y, goal.width, goal.height)

      for (const spike of spikes) {
        ctx.fillStyle = spike.color
        ctx.beginPath()
        ctx.moveTo(spike.x + spike.width / 2, spike.y)
        ctx.lineTo(spike.x, spike.y + spike.height)
        ctx.lineTo(spike.x + spike.width, spike.y + spike.height)
        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()

      // Draw player in fixed position relative to the camera
      const playerScreenY = player.y - cameraY
      ctx.fillStyle = player.color
      ctx.fillRect(player.x, playerScreenY, player.width, player.height)

      // Continue game loop
      if (!gameWon && !gameLost) {
        requestAnimationFrame(gameLoop)
      }
    }

    gameLoop()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Vertical Platform Game</h1>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-gray-300"
        />
        {gameWon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white text-4xl font-bold">You Win!</p>
          </div>
        )}
        {gameLost && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <p className="text-white text-4xl font-bold">Game Over!</p>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <p>Use left and right arrow keys to move, space to jump</p>
        <p>Reach the red square at the top to win!</p>
        <p>Avoid the yellow spikes!</p>
      </div>
    </div>
  )
}