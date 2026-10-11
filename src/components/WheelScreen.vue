<script setup>
import { ref, computed } from 'vue'
import BackButton from './BackButton.vue'

const emit = defineEmits(['back', 'spin', 'win'])

// Vibrant colors matching the user's reference image
const COLORS = [
  '#0088FF', // Player 1 - Blue
  '#FF2E5B', // Player 2 - Red/Coral
  '#FF3B9D', // Player 3 - Pink
  '#FF9100', // Player 4 - Orange
  '#310B91', // Player 5 - Deep Indigo / Purple
  '#00B67A', // Player 6 - Teal / Emerald
  '#9B3FBF', // Player 7 - Medium Purple
  '#74DF00', // Player 8 - Lime Green
  '#00C7D9', // Player 9 - Cyan
  '#FFC800', // Player 10 - Amber Gold
]

// Players list: state 1 starts empty
const players = ref([])
const newName = ref('')
const nameInputRef = ref(null)

const isSpinning = ref(false)
const rotationDegree = ref(0)
const winner = ref(null)

// Computed helpers
const hasEnoughPlayers = computed(() => players.value.length >= 2)

function addPerson() {
  const trimmed = newName.value.trim()
  if (!trimmed) {
    if (nameInputRef.value) nameInputRef.value.focus()
    return
  }

  // Prevent duplicate names gracefully (case-insensitive check)
  const isDuplicate = players.value.some(
    p => p.name.toLowerCase() === trimmed.toLowerCase()
  )
  if (isDuplicate) {
    const count = players.value.filter(
      p => p.name.toLowerCase().startsWith(trimmed.toLowerCase())
    ).length
    players.value.push({
      id: Date.now() + Math.random(),
      name: `${trimmed} ${count + 1}`
    })
  } else {
    players.value.push({
      id: Date.now() + Math.random(),
      name: trimmed
    })
  }

  newName.value = ''
  if (nameInputRef.value) nameInputRef.value.focus()
}

function removePerson(index) {
  if (isSpinning.value) return
  players.value.splice(index, 1)
  if (nameInputRef.value) nameInputRef.value.focus()
}

// Generate wheel slices dynamically
const wheelSegments = computed(() => {
  const count = players.value.length
  if (count === 0) {
    // 8 default demo segments matching the reference wheel
    const defaultLabels = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 4', 'Player 4', 'Player 5', 'Player 6']
    return COLORS.slice(0, 8).map((color, i) => ({
      color,
      label: defaultLabels[i] || `Player ${i + 1}`,
      number: `#${i + 1}`
    }))
  }

  if (count === 1) {
    return [{ color: COLORS[0], label: players.value[0].name, number: '#1' }]
  }

  return players.value.map((player, i) => {
    return {
      color: COLORS[i % COLORS.length],
      label: player.name,
      number: `#${i + 1}`
    }
  })
})

// Spin interaction
function spinWheel() {
  if (!hasEnoughPlayers.value || isSpinning.value) return

  isSpinning.value = true
  winner.value = null

  const count = players.value.length
  const segmentAngle = 360 / count
  const randomIndex = Math.floor(Math.random() * count)
  
  // Slices start from index 0 at startAngle = 0 to segmentAngle.
  // The top pointer is at 0 degrees (12 o'clock).
  // Midpoint angle of segment randomIndex in unrotated coordinate system is:
  // midAngle = randomIndex * segmentAngle + segmentAngle / 2.
  // When rotated by R degrees clockwise, that midpoint is at: (midAngle + R) % 360.
  // To have it stop at top pointer (0 deg / 360 deg), we need:
  // (midAngle + R) % 360 = 0  =>  R % 360 = (360 - midAngle) % 360.
  const extraRotations = 360 * 6
  const targetMod = (360 - (randomIndex * segmentAngle + segmentAngle / 2)) % 360
  const currentMod = rotationDegree.value % 360
  let diff = targetMod - currentMod
  if (diff < 0) diff += 360

  const finalDegree = rotationDegree.value + extraRotations + diff
  rotationDegree.value = finalDegree

  setTimeout(() => {
    isSpinning.value = false
    winner.value = players.value[randomIndex]
    emit('win', randomIndex + 1)
  }, 4200)
}

// Slice path for center (100, 100), radius 100, starting from top (0 deg = 12 o'clock)
function getSegmentPath(index, total) {
  if (total === 1) {
    return 'M 100 0 A 100 100 0 1 1 99.99 0 Z'
  }
  const r = 100
  const cx = 100
  const cy = 100
  const startAngle = (index * 360) / total - 90
  const endAngle = ((index + 1) * 360) / total - 90

  const startRad = (startAngle * Math.PI) / 180
  const endRad = (endAngle * Math.PI) / 180

  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)

  const largeArcFlag = 360 / total > 180 ? 1 : 0

  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
}

// Radial text coordinates: oriented outward along the slice bisector
function getTextTransform(index, total) {
  const midAngle = (index * 360) / total + (180 / total)
  // Rotate around center (100, 100) to midAngle, then text is at (100, 36) rotated -90deg so it reads radially
  return `rotate(${midAngle}, 100, 100) translate(100, 42) rotate(90)`
}
</script>

<template>
  <div class="absolute inset-0 bg-[#111111] flex flex-col overflow-hidden text-white font-poppins select-none">
    
    <!-- Top Bar with BackButton (Aligned with games & finger screens) -->
    <div class="px-[24px] pt-[86px] shrink-0 z-20">
      <BackButton @click="emit('back')" />
    </div>

    <!-- Scrollable content area so player list expands without overlapping CTA -->
    <div class="flex-1 overflow-y-auto hide-scrollbar px-[24px] pt-[8px] pb-[100px] flex flex-col">
      
      <!-- Wheel Container -->
      <div class="relative w-full flex items-center justify-center my-[14px] shrink-0">
        <div class="relative w-[230px] h-[236px] flex flex-col items-center justify-end">
          
          <!-- Top Pointer (Green rounded teardrop/pin pointing DOWN at 12 o'clock) -->
          <div class="absolute top-[0px] left-1/2 -translate-x-1/2 z-30 pointer-events-none drop-shadow-md">
            <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
              <!-- Soft white outer border highlight for pointer -->
              <path
                d="M12 25 C10.8 23 4 14 4 8 C4 3.5 7.5 1 12 1 C16.5 1 20 3.5 20 8 C20 14 13.2 23 12 25 Z"
                fill="#27AE60"
                stroke="#FFFFFF"
                stroke-width="1.8"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <!-- Rotating Wheel SVG -->
          <div class="relative w-[216px] h-[216px] rounded-full shadow-2xl flex items-center justify-center overflow-visible">
            <svg
              class="w-full h-full rounded-full"
              viewBox="0 0 200 200"
              :style="{
                transform: `rotate(${rotationDegree}deg)`,
                transition: isSpinning ? 'transform 4.2s cubic-bezier(0.12, 0.92, 0.2, 1)' : 'none'
              }"
            >
              <defs>
                <!-- Yellow Center Hub Radial Gradient matching reference -->
                <radialGradient id="centerHubGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stop-color="#FFF566" />
                  <stop offset="70%" stop-color="#F2C900" />
                  <stop offset="100%" stop-color="#D9A800" />
                </radialGradient>
              </defs>

              <!-- Segments / Slices -->
              <g>
                <path
                  v-for="(seg, i) in wheelSegments"
                  :key="'slice-' + i"
                  :d="getSegmentPath(i, wheelSegments.length)"
                  :fill="seg.color"
                />
              </g>

              <!-- Text labels inside each slice (radial orientation matching reference) -->
              <g>
                <text
                  v-for="(seg, i) in wheelSegments"
                  :key="'lbl-' + i"
                  :transform="getTextTransform(i, wheelSegments.length)"
                  fill="#FFFFFF"
                  font-family="'Poppins', sans-serif"
                  font-size="10.5"
                  font-weight="500"
                  text-anchor="middle"
                  dominant-baseline="central"
                  style="letter-spacing: -0.2px;"
                >
                  {{ seg.label.length > 9 ? seg.label.slice(0, 8) + '…' : seg.label }}
                </text>
              </g>

              <!-- Clean 3px white outer stroke following exact perimeter of the wheel -->
              <circle
                cx="100"
                cy="100"
                r="98.5"
                fill="none"
                stroke="#FFFFFF"
                stroke-width="3"
              />

              <!-- Center Hub (Yellow circle with thin 1px white stroke matching reference) -->
              <circle
                cx="100"
                cy="100"
                r="14"
                fill="url(#centerHubGrad)"
                stroke="#FFFFFF"
                stroke-width="1"
              />
            </svg>
          </div>

        </div>
      </div>

      <!-- ADD PEOPLE SECTION -->
      <div class="w-full flex flex-col mt-[8px]">
        
        <!-- Add people heading (20px, Poppins, -0.5px letter spacing, 24px line height) -->
        <h2
          class="font-poppins text-white font-medium"
          style="font-size: 20px; line-height: 24px; letter-spacing: -0.5px;"
        >
          Add people
        </h2>

        <!-- Description (8px gap from heading, 14px, regular, -0.5px letter spacing, 20px line height) -->
        <p
          class="font-poppins text-[#BDBDBD] font-normal mt-[8px]"
          style="font-size: 14px; line-height: 20px; letter-spacing: -0.5px;"
        >
          Add everyone at the table. Yes, even the one<br />
          hiding in the loo.
        </p>

        <!-- Input row (20px gap from description) -->
        <div class="w-full flex items-center gap-[12px] mt-[20px]">
          <!-- Name input -->
          <input
            ref="nameInputRef"
            v-model="newName"
            @keydown.enter.prevent="addPerson"
            type="text"
            placeholder="Enter name (e.g. Visva)"
            class="flex-1 h-[48px] rounded-[16px] bg-[#1E1E1E] border border-[#2E2E2E] px-[16px] font-poppins text-[14px] text-white placeholder-[#707070] focus:outline-none focus:border-[#6028E9] transition-colors"
          />

          <!-- Add person button (12px gap from input, person-plus icon, dark bg, border) -->
          <button
            @click="addPerson"
            type="button"
            aria-label="Add person"
            class="w-[48px] h-[48px] shrink-0 rounded-[16px] bg-[#1E1E1E] border border-[#2E2E2E] flex items-center justify-center text-[#CFCFCF] hover:text-white hover:border-[#444444] active:scale-95 transition-all"
          >
            <!-- Person-plus icon SVG -->
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </button>
        </div>

        <!-- STATE 1: Fewer than 2 players -> Supporting text (16px gap from input row) -->
        <p
          v-if="!hasEnoughPlayers"
          class="mt-[16px] text-center text-[#88888A] select-none"
          style="font-family: 'Chalkduster', 'Comic Sans MS', cursive; font-size: 11px; letter-spacing: -0.5px;"
        >
          Add at least 2 names to spin.
        </p>

        <!-- STATE 2: Player list once players are added (16px gap from input row, 12px gap between cards) -->
        <div v-if="players.length > 0" class="w-full flex flex-col gap-[12px] mt-[16px]">
          <div
            v-for="(player, idx) in players"
            :key="player.id"
            class="w-full h-[52px] rounded-[16px] bg-[#1E1E1E] border border-[#2A2A2A] px-[18px] flex items-center justify-between transition-all"
          >
            <!-- LEFT: Player number (#1, #2...) with corresponding wheel accent color -->
            <span
              class="font-poppins font-medium text-[14px] shrink-0 w-[36px]"
              :style="{ color: COLORS[idx % COLORS.length] }"
            >
              #{{ idx + 1 }}
            </span>

            <!-- CENTER: Player name -->
            <span class="flex-1 font-poppins text-white font-normal text-[15px] truncate px-[10px]">
              {{ player.name }}
            </span>

            <!-- RIGHT: Trash / Delete icon -->
            <button
              @click="removePerson(idx)"
              type="button"
              aria-label="Delete player"
              class="p-[6px] text-[#707070] hover:text-[#FF5257] active:scale-90 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </div>

      </div>

    </div>

    <!-- Fixed Bottom CTA: "Who pays?" (24px bottom safe-area spacing) -->
    <div
      class="absolute left-0 right-0 bottom-0 px-[24px] pb-[24px] pt-[16px] z-20 pointer-events-auto"
      style="background: linear-gradient(to top, #111111 80%, rgba(17, 17, 17, 0) 100%);"
    >
      <button
        @click="spinWheel"
        :disabled="!hasEnoughPlayers || isSpinning"
        type="button"
        class="w-full h-[50px] font-poppins font-medium text-[15px] leading-[18px] text-white rounded-[16px] flex items-center justify-center transition-all select-none"
        :class="[
          hasEnoughPlayers && !isSpinning
            ? 'bg-[#6028E9] shadow-[0px_4px_0px_0px_#3D0E95] hover:bg-[#5020c9] active:scale-95 cursor-pointer'
            : 'bg-[#262626] text-[#777777] border border-[#333333] cursor-not-allowed opacity-80'
        ]"
        style="letter-spacing: -0.5px;"
      >
        <span v-if="isSpinning" class="font-poppins font-medium text-[15px] leading-[18px]" style="letter-spacing: -0.5px;">Spinning...</span>
        <span v-else class="font-poppins font-medium text-[15px] leading-[18px]" style="letter-spacing: -0.5px;">Who pays?</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>
