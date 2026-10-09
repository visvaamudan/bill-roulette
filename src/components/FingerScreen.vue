<script setup>
import { ref, onUnmounted, computed, watch } from 'vue'
import BackButton from './BackButton.vue'
import TapCards from './TapCards.vue'

const emit = defineEmits(['back', 'win'])
const tapMode = ref(false)
const eggStage = ref('whole') // 'whole' | 'cracked' | 'fried'
const shaking = ref(false)
const popping = ref(false)

// --- Timing constants (shared with TapCards via props) ---
const COUNTDOWN_MS  = 8000
const WINNER_HOLD_MS = 3000

// --- Toggle helpers ---
const timeoutIds = []
function clearAllTimeouts() {
  timeoutIds.forEach(id => clearTimeout(id))
  timeoutIds.length = 0
}
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const tapCardsRef = ref(null)

function toggleTapMode() {
  // Reset both modes before flipping
  clearAllTimeouts()
  clearCountdown()
  // Reset free-touch state
  activeFingers.value = []
  winner.value = null
  isGameOver.value = false
  // Reset tap-cards state (if the component is mounted)
  if (tapCardsRef.value) tapCardsRef.value.reset()

  tapMode.value = !tapMode.value

  if (tapMode.value) {
    // ON: whole → cracked → fried
    eggStage.value = 'whole'
    if (prefersReducedMotion()) {
      eggStage.value = 'fried'
    } else {
      timeoutIds.push(setTimeout(() => { eggStage.value = 'cracked'; shaking.value = true; timeoutIds.push(setTimeout(() => shaking.value = false, 200)) }, 150))
      timeoutIds.push(setTimeout(() => { eggStage.value = 'fried'; popping.value = true; timeoutIds.push(setTimeout(() => popping.value = false, 250)) }, 400))
    }
  } else {
    // OFF: fried → cracked → whole
    eggStage.value = 'fried'
    if (prefersReducedMotion()) {
      eggStage.value = 'whole'
    } else {
      timeoutIds.push(setTimeout(() => { eggStage.value = 'cracked'; shaking.value = true; timeoutIds.push(setTimeout(() => shaking.value = false, 200)) }, 0))
      timeoutIds.push(setTimeout(() => { eggStage.value = 'whole' }, 150))
    }
  }
}

// --- Free-touch gameplay state ---
const COLORS = ['#FF5257', '#007AFF', '#FDC700', '#5FB848', '#5B16E0', '#FF8A00', '#FF4FB0', '#00D1D1', '#B6E800', '#A66BFF']

const activeFingers = ref([])  // {id, x, y, order, color, opacity, isWinner}
const winner = ref(null)
const isGameOver = ref(false)

const allIndicators = computed(() => activeFingers.value)
const playerCount   = computed(() => allIndicators.value.length)

let countdownTimeout = null
let flickerInterval  = null
let resultTimeout    = null

function startCountdown() {
  clearCountdown()
  flickerInterval = setInterval(() => {
    allIndicators.value.forEach(ind => {
      ind.opacity = Math.random() < 0.5 ? 1 : 0.2
    })
  }, 300)
  countdownTimeout = setTimeout(() => {
    const eligible = allIndicators.value
    if (eligible.length === 0) return
    const win = eligible[Math.floor(Math.random() * eligible.length)]
    winner.value = win.order
    eligible.forEach(ind => {
      ind.opacity  = ind.order === winner.value ? 1    : 0.15
      ind.isWinner = ind.order === winner.value
    })
    isGameOver.value = true
    clearInterval(flickerInterval)
    flickerInterval = null
    resultTimeout = setTimeout(() => {
      emit('win', winner.value)
    }, WINNER_HOLD_MS)
  }, COUNTDOWN_MS)
}

function clearCountdown() {
  if (countdownTimeout) { clearTimeout(countdownTimeout); countdownTimeout = null }
  if (flickerInterval)  { clearInterval(flickerInterval); flickerInterval = null }
  if (resultTimeout)    { clearTimeout(resultTimeout);    resultTimeout = null }
}

watch(playerCount, (n) => {
  if (isGameOver.value) return
  if (n >= 2) startCountdown()
  else clearCountdown()
})

onUnmounted(() => {
  clearAllTimeouts()
  clearCountdown()
})

// --- Pointer handlers (free-touch mode only) ---
const playArea = ref(null)

function getRelative(e) {
  const rect = playArea.value.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onPointerDown(e) {
  e.preventDefault()
  if (tapMode.value) return
  if (activeFingers.value.find(p => p.id === e.pointerId)) return
  if (isGameOver.value) return
  const { x, y } = getRelative(e)
  const order = activeFingers.value.length + 1
  const color = COLORS[(order - 1) % COLORS.length]
  console.log('pointerdown', x, y, activeFingers.value.length)
  activeFingers.value.push({ id: e.pointerId, x, y, order, color, opacity: 1, isWinner: false })
}

function onPointerMove(e) {
  if (tapMode.value) return
  const finger = activeFingers.value.find(p => p.id === e.pointerId)
  if (finger) {
    const { x, y } = getRelative(e)
    finger.x = x
    finger.y = y
  }
}

function onPointerUp(e) {
  if (tapMode.value) return
  if (isGameOver.value) return
  const idx = activeFingers.value.findIndex(p => p.id === e.pointerId)
  if (idx !== -1) activeFingers.value.splice(idx, 1)
}

function onPointerCancel(e) { onPointerUp(e) }

// --- Back: clear everything ---
function handleBack() {
  clearAllTimeouts()
  clearCountdown()
  if (tapCardsRef.value) tapCardsRef.value.reset()
  activeFingers.value = []
  winner.value = null
  isGameOver.value = false
  emit('back')
}
</script>

<template>
  <div class="absolute inset-0 bg-[#111111]">

    <!-- Preload egg images -->
    <div class="hidden" aria-hidden="true">
      <img src="/assets/egg_whole.png" alt="" />
      <img src="/assets/egg_cracked.png" alt="" />
      <img src="/assets/egg_fried.png" alt="" />
    </div>

    <!-- TOP ROW: Back + Tap Mode -->
    <div class="absolute left-0 right-0 flex flex-row items-center justify-between px-[24px]"
         style="top: 86px; z-index: 20; pointer-events: auto;">
      <BackButton @click="handleBack" />
      <div class="flex items-center gap-[4px]" style="pointer-events: auto;">
        <span class="font-poppins text-[12px] font-medium text-white">Tap mode:</span>
        <button role="switch"
                :aria-checked="tapMode"
                aria-label="Tap mode"
                @click.stop="toggleTapMode"
                class="relative w-[48px] h-[26px] rounded-full border border-[#333333] transition-colors duration-300 cursor-pointer overflow-visible"
                :style="{ backgroundColor: tapMode ? '#5C5C54' : '#222222' }">
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

    <!-- FREE-TOUCH MODE -->
    <template v-if="!tapMode">
      <!-- Idle text: centered in full screen -->
      <div v-if="playerCount === 0"
           class="absolute inset-0 flex flex-col items-center justify-center text-center"
           style="pointer-events: none; z-index: 5;">
        <h1 class="font-poppins font-medium text-white whitespace-nowrap"
            style="font-size: 20px; line-height: 28px; letter-spacing: -0.5px;">Everyone hold a finger down</h1>
        <p class="font-poppins font-[300] text-[#BDBDBD] whitespace-nowrap mt-[8px]"
           style="font-size: 13px; line-height: 20px; letter-spacing: -0.5px;">Need at least two to start the countdown</p>
      </div>

      <!-- Play area -->
      <div
        ref="playArea"
        class="absolute left-0 right-0 bottom-0"
        style="top: 130px; touch-action: none; z-index: 10;"
        @pointerdown.prevent="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
      >
        <!-- Bottom player count text -->
        <p v-if="playerCount > 0"
           class="absolute bottom-[12px] w-full text-center text-[11px]"
           style="font-family: 'Chalkduster', 'Comic Sans MS', cursive; color: #CFCFCF; pointer-events: none;">
          {{ playerCount }} players are playing right now.
        </p>

        <!-- Finger indicators -->
        <div
          v-for="ind in allIndicators"
          :key="ind.id"
          class="absolute"
          style="pointer-events: none;"
          :style="{
            left: ind.x + 'px',
            top: ind.y + 'px',
            opacity: ind.opacity,
            transition: 'opacity 150ms',
            transform: 'translate(-50%, -50%)',
          }"
        >
          <div class="w-[104px] h-[104px] rounded-full flex items-center justify-center"
               :style="{ border: `2px solid ${ind.color}` }">
            <div class="w-[80px] h-[80px] rounded-full flex items-center justify-center"
                 :style="{ backgroundColor: ind.color, transform: ind.isWinner ? 'scale(1.1)' : 'scale(1)', transition: 'transform 300ms' }">
              <span class="font-poppins text-white font-semibold" style="font-size: 18px;">{{ ind.order }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- TAP CARDS MODE -->
    <div v-else
         class="absolute left-0 right-0 bottom-0"
         style="top: 130px; z-index: 10;">
      <TapCards
        ref="tapCardsRef"
        :countdown-ms="COUNTDOWN_MS"
        :winner-hold-ms="WINNER_HOLD_MS"
        @win="(n) => emit('win', n)"
      />
    </div>

  </div>
</template>

<style scoped>
@keyframes egg-shake {
  0%   { transform: rotate(0deg); }
  25%  { transform: rotate(-8deg); }
  50%  { transform: rotate(8deg); }
  75%  { transform: rotate(-4deg); }
  100% { transform: rotate(0deg); }
}
@keyframes egg-pop {
  0%   { transform: scale(0.7); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.egg-shake { animation: egg-shake 200ms ease-in-out; }
.egg-pop   { animation: egg-pop 250ms ease-in-out; }
@media (prefers-reduced-motion: reduce) {
  .egg-shake, .egg-pop { animation: none; }
}
</style>
