<script setup>
import { ref, onUnmounted, computed, watch } from 'vue'
import BackButton from './BackButton.vue'

const emit = defineEmits(['back','win'])
const tapMode = ref(false)
const eggStage = ref('whole') // 'whole' | 'cracked' | 'fried'
const shaking = ref(false)
const popping = ref(false)

// Existing toggle logic (unchanged)
const timeoutIds = []
function clearAllTimeouts() {
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds.length = 0
}
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function toggleTapMode() {
  clearAllTimeouts()
  tapMode.value = !tapMode.value
  if (tapMode.value) {
    // Turning ON: whole → cracked (150ms) → fried (400ms)
    eggStage.value = 'whole'
    if (prefersReducedMotion()) {
      eggStage.value = 'fried'
    } else {
      timeoutIds.push(setTimeout(() => { eggStage.value = 'cracked'; shaking.value = true; timeoutIds.push(setTimeout(() => shaking.value = false, 200)) }, 150))
      timeoutIds.push(setTimeout(() => { eggStage.value = 'fried'; popping.value = true; timeoutIds.push(setTimeout(() => popping.value = false, 250)) }, 400))
    }
  } else {
    // Turning OFF: fried → cracked (0ms) → whole (150ms)
    eggStage.value = 'fried'
    if (prefersReducedMotion()) {
      eggStage.value = 'whole'
    } else {
      timeoutIds.push(setTimeout(() => { eggStage.value = 'cracked'; shaking.value = true; timeoutIds.push(setTimeout(() => shaking.value = false, 200)) }, 0))
      timeoutIds.push(setTimeout(() => { eggStage.value = 'whole' }, 150))
    }
  }
}

onUnmounted(() => clearAllTimeouts())

// --- Gameplay state ---
const COLORS = ['#FF5257', '#007AFF', '#FDC700', '#5FB848', '#5B16E0', '#FF8A00', '#FF4FB0', '#00D1D1', '#B6E800', '#A66BFF']

// Active finger indicators (for pointer events)
const activeFingers = ref([]) // {id, x, y, order, color, opacity, isWinner}
// Fixed indicators for tap mode (desktop testing)
const tapIndicators = ref([]) // same shape but without pointerId

const winner = ref(null) // winning order number
const isGameOver = ref(false)

const allIndicators = computed(() => {
  return [...activeFingers.value, ...tapIndicators.value]
})

const playerCount = computed(() => allIndicators.value.length)

let countdownTimeout = null
let flickerInterval = null
let resultTimeout = null

function startCountdown() {
  clearCountdown()
  // flicker interval
  flickerInterval = setInterval(() => {
    allIndicators.value.forEach(ind => {
      ind.opacity = Math.random() < 0.5 ? 1 : 0.2
    })
  }, 300)
  timeoutIds.push(flickerInterval)
  // 10s countdown
  countdownTimeout = setTimeout(() => {
    const eligible = allIndicators.value
    if (eligible.length === 0) return
    const winIndex = Math.floor(Math.random() * eligible.length)
    const win = eligible[winIndex]
    winner.value = win.order
    eligible.forEach(ind => {
      if (ind.order === winner.value) {
        ind.opacity = 1
        ind.isWinner = true
      } else {
        ind.opacity = 0.15
        ind.isWinner = false
      }
    })
    isGameOver.value = true
    clearInterval(flickerInterval)
    // after 3s emit win event
    resultTimeout = setTimeout(() => {
      emit('win', winner.value)
    }, 3000)
    timeoutIds.push(resultTimeout)
  }, 10000)
  timeoutIds.push(countdownTimeout)
}

function clearCountdown() {
  if (countdownTimeout) { clearTimeout(countdownTimeout); countdownTimeout = null }
  if (flickerInterval) { clearInterval(flickerInterval); flickerInterval = null }
}

watch(playerCount, (newCount) => {
  if (isGameOver.value) return
  if (newCount >= 2) {
    startCountdown()
  } else {
    clearCountdown()
  }
})

// Pointer event handlers
function onPointerDown(e) {
  if (tapMode.value) return
  if (activeFingers.value.find(p => p.id === e.pointerId)) return
  const order = activeFingers.value.length + 1
  const color = COLORS[(order - 1) % COLORS.length]
  activeFingers.value.push({
    id: e.pointerId,
    x: e.clientX,
    y: e.clientY,
    order,
    color,
    opacity: 1,
    isWinner: false,
  })
}
function onPointerMove(e) {
  if (tapMode.value) return
  const finger = activeFingers.value.find(p => p.id === e.pointerId)
  if (finger) {
    finger.x = e.clientX
    finger.y = e.clientY
  }
}
function onPointerUp(e) {
  if (tapMode.value) return
  const idx = activeFingers.value.findIndex(p => p.id === e.pointerId)
  if (idx !== -1) activeFingers.value.splice(idx, 1)
}
function onPointerCancel(e) { onPointerUp(e) }

// Tap mode click handling (desktop testing)
function onTapClick(e) {
  if (!tapMode.value) return
  const x = e.clientX
  const y = e.clientY
  const hitIdx = tapIndicators.value.findIndex(ind => {
    const dx = ind.x - x
    const dy = ind.y - y
    return Math.hypot(dx, dy) <= 28
  })
  if (hitIdx !== -1) {
    tapIndicators.value.splice(hitIdx, 1)
    return
  }
  const order = tapIndicators.value.length + 1
  const color = COLORS[(order - 1) % COLORS.length]
  tapIndicators.value.push({
    id: Date.now() + Math.random(),
    x,
    y,
    order,
    color,
    opacity: 1,
    isWinner: false,
  })
}
</script>

<template>
  <div class="absolute inset-0 bg-[#111111] flex flex-col"
       @pointerdown="onPointerDown"
       @pointermove="onPointerMove"
       @pointerup="onPointerUp"
       @pointercancel="onPointerCancel"
       @click="onTapClick"
       style="touch-action:none;">
    <!-- Preload egg images -->
    <div class="hidden" aria-hidden="true">
      <img src="/assets/egg_whole.png" alt="" />
      <img src="/assets/egg_cracked.png" alt="" />
      <img src="/assets/egg_fried.png" alt="" />
    </div>

    <!-- Top Row: Back + Tap Mode toggle -->
    <div class="absolute left-0 right-0 flex flex-row items-center justify-between px-[24px]" style="top: 74px;">
      <BackButton @click="emit('back')" />
      <div class="flex items-center gap-[4px]">
        <span class="font-poppins text-[12px] font-medium text-white">Tap mode:</span>
        <button role="switch"
                :aria-checked="tapMode"
                aria-label="Tap mode"
                @click="toggleTapMode"
                class="relative w-[48px] h-[26px] rounded-full border border-[#333333] transition-colors duration-300 cursor-pointer overflow-visible"
                :class="tapMode ? 'bg-[#7D45E6]' : 'bg-[#222222]'">
          <div class="absolute top-1/2 left-0 w-[30px] h-[30px]"
               :style="{ transform: `translateX(${tapMode ? 18 : 0}px) translateY(-50%)`, transition: 'transform 300ms ease-in-out' }">
            <div class="w-full h-full relative" :class="[shaking ? 'egg-shake' : '', popping ? 'egg-pop' : '']">
              <img src="/assets/egg_whole.png" alt=""
                   class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-[120ms]"
                   :class="eggStage === 'whole' ? 'opacity-100' : 'opacity-0'" />
              <img src="/assets/egg_cracked.png" alt=""
                   class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-[120ms]"
                   :class="eggStage === 'cracked' ? 'opacity-100' : 'opacity-0'" />
              <img src="/assets/egg_fried.png" alt=""
                   class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-[120ms]"
                   :class="eggStage === 'fried' ? 'opacity-100' : 'opacity-0'" />
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Center Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-[24px] text-center">
      <h1 v-if="playerCount === 0" class="font-poppins text-[20px] font-medium text-white leading-[24px] whitespace-nowrap">Everyone hold a finger down</h1>
      <p v-if="playerCount === 0" class="font-poppins text-[13px] font-[300] text-[#BDBDBD] leading-[18px] mt-[8px]">Need at least two to start the countdown</p>
    </div>

    <!-- Bottom text for player count -->
    <p v-if="playerCount > 0" class="absolute bottom-[12px] w-full text-center font-poppins text-[11px]" style="font-family: 'Chalkduster', 'Comic Sans MS', cursive; color: #CFCFCF;">{{ playerCount }} players are playing right now.</p>

    <!-- Indicators -->
    <div v-for="ind in allIndicators" :key="ind.id" class="pointer-events-none absolute"
         :style="{ left: ind.x + 'px', top: ind.y + 'px', opacity: ind.opacity, transition: 'opacity 150ms' }">
      <div class="w-[56px] h-[56px] rounded-full border-[1.5px]" :style="{ borderColor: ind.color }"></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-[44px] h-[44px] rounded-full flex items-center justify-center"
             :style="{ backgroundColor: ind.color, transform: ind.isWinner ? 'scale(1.15)' : 'scale(1)' }">
          <span class="font-poppins text-white text-[14px]">{{ ind.order }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes egg-shake {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
  75% { transform: rotate(-4deg); }
  100% { transform: rotate(0deg); }
}
@keyframes egg-pop {
  0% { transform: scale(0.7); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.egg-shake { animation: egg-shake 200ms ease-in-out; }
.egg-pop { animation: egg-pop 250ms ease-in-out; }
@media (prefers-reduced-motion: reduce) {
  .egg-shake, .egg-pop { animation: none; }
}
</style>
