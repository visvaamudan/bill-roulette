<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({
  countdownMs: { type: Number, default: 8000 },
  winnerHoldMs: { type: Number, default: 3000 },
})
const emit = defineEmits(['win'])

const COLORS = ['#FF5257', '#007AFF', '#FDC700', '#5FB848', '#5B16E0', '#FF8A00', '#FF4FB0', '#00D1D1', '#B6E800', '#A66BFF']

// Each card: { type: 'player'|'add', number: null|N, activated: false, opacity: 1, isWinner: false }
const cards = ref([
  { type: 'player', number: 1, activated: false, opacity: 1, isWinner: false },
  { type: 'player', number: 2, activated: false, opacity: 1, isWinner: false },
  { type: 'add',    number: null, activated: false, opacity: 1, isWinner: false },
  { type: 'add',    number: null, activated: false, opacity: 1, isWinner: false },
])

const isGameOver = ref(false)
const nextPlayerNumber = ref(3)

const activatedCards = computed(() => cards.value.filter(c => c.type === 'player' && c.activated))
const activatedCount = computed(() => activatedCards.value.length)

// --- Timers ---
let countdownTimeout = null
let flickerInterval = null
let resultTimeout = null

function clearTimers() {
  if (countdownTimeout) { clearTimeout(countdownTimeout); countdownTimeout = null }
  if (flickerInterval)  { clearInterval(flickerInterval); flickerInterval = null }
  if (resultTimeout)    { clearTimeout(resultTimeout);    resultTimeout = null }
}

function startCountdown() {
  clearTimers()
  flickerInterval = setInterval(() => {
    cards.value.forEach(c => {
      if (c.type === 'player' && c.activated) {
        c.opacity = Math.random() < 0.5 ? 1 : 0.2
      }
    })
  }, 300)

  countdownTimeout = setTimeout(() => {
    const eligible = activatedCards.value
    if (eligible.length === 0) return
    const winCard = eligible[Math.floor(Math.random() * eligible.length)]
    clearInterval(flickerInterval)
    flickerInterval = null
    cards.value.forEach(c => {
      c.opacity  = c === winCard ? 1 : 0.15
      c.isWinner = c === winCard
    })
    isGameOver.value = true
    resultTimeout = setTimeout(() => {
      emit('win', winCard.number)
    }, props.winnerHoldMs)
  }, props.countdownMs)
}

// --- Public reset (called from FingerScreen on toggle) ---
function reset() {
  clearTimers()
  isGameOver.value = false
  nextPlayerNumber.value = 3
  cards.value = [
    { type: 'player', number: 1, activated: false, opacity: 1, isWinner: false },
    { type: 'player', number: 2, activated: false, opacity: 1, isWinner: false },
    { type: 'add',    number: null, activated: false, opacity: 1, isWinner: false },
    { type: 'add',    number: null, activated: false, opacity: 1, isWinner: false },
  ]
}
defineExpose({ reset })

// --- Card click ---
function onCardClick(card) {
  if (isGameOver.value) return
  if (card.type === 'add') {
    card.type      = 'player'
    card.number    = nextPlayerNumber.value++
    card.activated = false
    card.opacity   = 1
    card.isWinner  = false
    // Append new row of Add cards if none remain and room for more
    const addCount    = cards.value.filter(c => c.type === 'add').length
    const playerCount = cards.value.filter(c => c.type === 'player').length
    if (addCount === 0 && playerCount < 10) {
      cards.value.push(
        { type: 'add', number: null, activated: false, opacity: 1, isWinner: false },
        { type: 'add', number: null, activated: false, opacity: 1, isWinner: false },
      )
    }
    return
  }
  // Player card — activate once
  if (card.activated) return
  card.activated = true
  card.opacity   = 1
  if (activatedCount.value >= 2) {
    startCountdown()   // restart whenever a new card joins and count ≥ 2
  }
}

// --- Card style helper ---
function cardStyle(card) {
  const base = {
    opacity:   card.opacity,
    transform: card.isWinner ? 'scale(1.05)' : 'scale(1)',
  }
  if (card.type === 'add') {
    return {
      ...base,
      background:  'transparent',
      border:      '1.5px dashed #3A3A3A',
    }
  }
  // Player card
  const color = card.activated ? COLORS[(card.number - 1) % COLORS.length] : null
  return {
    ...base,
    background: color || '#1B1B1B',
    border:     color ? 'none' : '1px solid #2E2E2E',
  }
}

onUnmounted(() => clearTimers())
</script>

<template>
  <!-- Positioned inside FingerScreen's play area (top:130px absolute div).
       Starts 30px below that div's top edge via padding-top. -->
  <div class="absolute left-0 right-0 bottom-0 overflow-y-auto hide-scrollbar px-[24px]"
       style="top: 0; padding-top: 30px;">
    <div class="grid grid-cols-2 gap-[12px] pb-[24px]">
      <div
        v-for="(card, idx) in cards"
        :key="idx"
        @click="onCardClick(card)"
        class="card-cell flex flex-col items-center justify-center text-center cursor-pointer select-none"
        :style="cardStyle(card)"
      >
        <!-- ADD PLAYER card -->
        <template v-if="card.type === 'add'">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="14" cy="14" r="13" stroke="#9A9A9A" stroke-width="1.5"/>
            <path d="M14 9v10M9 14h10" stroke="#9A9A9A" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <p class="mt-[12px] font-poppins text-[16px] leading-[22px]" style="color: #8F8F8F;">Add player</p>
        </template>

        <!-- PLAYER card -->
        <template v-else>
          <p class="font-poppins font-[500] text-white"
             style="font-size: 20px; line-height: 28px; text-shadow: 0 1px 4px rgba(0,0,0,0.4);">
            Player {{ String(card.number).padStart(2, '0') }}
          </p>
          <p class="font-poppins text-[14px] leading-[20px] mt-[12px]"
             :style="{ color: card.activated ? 'rgba(255,255,255,0.85)' : '#9A9A9A' }">
            Hold your finger here.
          </p>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

.card-cell {
  height: 190px;
  border-radius: 32px;
  transition: opacity 150ms ease, transform 300ms ease;
}
</style>
