<script setup>
import { ref, onMounted } from 'vue'
import StatusBar from './StatusBar.vue'

const props = defineProps({
  winner: { type: Number, required: true },
})
const emit = defineEmits(['restart', 'rate'])

function onRestart() { emit('restart') }
function onRate()    { emit('rate') }

// --- Confetti burst setup ---
const CONFETTI_COLORS = ['#FF5257', '#007AFF', '#FDC700', '#5FB848', '#5B16E0', '#FF8A00', '#FF4FB0']
const showConfetti = ref(true)

// Build 75 pieces: 25 per burst origin.
// Burst A: top-center  → fan downward/outward  (dy positive, dx spread)
// Burst B: bottom-left → fan upward/inward      (dy negative, dx positive)
// Burst C: bottom-right→ fan upward/inward      (dy negative, dx negative)
function randBetween(a, b) { return a + Math.random() * (b - a) }

function makePieces() {
  const pieces = []
  // Burst A — top center: dx ∈ [-160,160], dy ∈ [80,260]
  for (let i = 0; i < 25; i++) {
    pieces.push({
      id: `a${i}`,
      originX: '50%',
      originY: '0px',
      dx: randBetween(-160, 160),
      dy: randBetween(80, 260),
      rot: randBetween(-360, 360),
      delay: randBetween(0, 150),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    })
  }
  // Burst B — bottom-left: dx ∈ [30,220], dy ∈ [-280,-80]
  for (let i = 0; i < 25; i++) {
    pieces.push({
      id: `b${i}`,
      originX: '0px',
      originY: '100%',
      dx: randBetween(30, 220),
      dy: randBetween(-280, -80),
      rot: randBetween(-360, 360),
      delay: randBetween(0, 150),
      color: CONFETTI_COLORS[(i + 2) % CONFETTI_COLORS.length],
    })
  }
  // Burst C — bottom-right: dx ∈ [-220,-30], dy ∈ [-280,-80]
  for (let i = 0; i < 25; i++) {
    pieces.push({
      id: `c${i}`,
      originX: '100%',
      originY: '100%',
      dx: randBetween(-220, -30),
      dy: randBetween(-280, -80),
      rot: randBetween(-360, 360),
      delay: randBetween(0, 150),
      color: CONFETTI_COLORS[(i + 4) % CONFETTI_COLORS.length],
    })
  }
  return pieces
}

const pieces = makePieces()

// Remove confetti from DOM after 3s (animation is 2.5s + max 150ms delay)
onMounted(() => {
  setTimeout(() => { showConfetti.value = false }, 3000)
})
</script>

<template>
  <div class="absolute inset-0 bg-[#111111] flex flex-col items-center" style="font-family: 'Poppins', sans-serif;">
    <StatusBar />

    <!-- Content — sits above confetti via z-index -->
    <div class="flex-1 flex flex-col items-center justify-center px-[24px] text-center" style="position: relative; z-index: 10;">
      <img src="/assets/winner_chicken.png" alt="" class="w-[80px] h-[80px] rounded-2xl" />
      <div class="mt-[24px]">
        <p class="font-poppins text-[14px] leading-[20px] text-[#CFCFCF]">The bill goes to...</p>
      </div>
      <div class="mt-[16px]">
        <p class="font-chango text-[36px] leading-[40px] tracking-[-1.5px] text-white">
          Player <span style="color: #FFF176;">{{ props.winner }}</span>
        </p>
      </div>
      <div class="mt-[16px]">
        <p class="font-poppins text-[14px] leading-[20px] text-[#BDBDBD]">Your card is sweating already.</p>
      </div>
      <div class="mt-[40px] flex flex-col gap-[16px]">
        <button
          @click="onRate"
          class="w-[327px] h-[50px] bg-[#6028E9] text-white font-poppins font-medium text-[15px] leading-[18px] rounded-[16px] shadow-[0px_4px_0px_0px_#3D0E95] transition-all active:scale-95 flex items-center justify-center gap-[6px]"
          style="letter-spacing: -0.5px;"
        >
          <span class="font-poppins font-medium text-[15px] leading-[18px]" style="letter-spacing: -0.5px;">Rate the meal</span>
          <img src="/assets/star_blush.png" alt="star" class="w-[20px] h-[20px] object-contain pointer-events-none select-none inline-block" />
        </button>
        <button
          @click="onRestart"
          class="w-[327px] h-[50px] border border-[#333333] text-[#BDBDBD] font-poppins font-medium text-[15px] leading-[18px] rounded-[16px] flex items-center justify-center active:scale-95 transition-all"
          style="letter-spacing: -0.5px;"
        >
          <span class="font-poppins font-medium text-[15px] leading-[18px]" style="letter-spacing: -0.5px;">Run it back</span>
        </button>
      </div>
    </div>

    <!-- Confetti burst layer — behind content, removed after 3s -->
    <div v-if="showConfetti"
         class="absolute inset-0 overflow-hidden"
         style="pointer-events: none; z-index: 1;">
      <div
        v-for="p in pieces"
        :key="p.id"
        class="confetti-piece"
        :style="{
          '--dx': p.dx + 'px',
          '--dy': p.dy + 'px',
          '--rot': p.rot + 'deg',
          '--delay': p.delay + 'ms',
          left: p.originX,
          top: p.originY,
          backgroundColor: p.color,
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes confetti-burst {
  0% {
    transform: translate(0, 0) rotate(0deg) scale(0);
    opacity: 1;
  }
  40% {
    transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), calc(var(--dy) + 120px)) rotate(calc(var(--rot) + 60deg)) scale(0.8);
    opacity: 0;
  }
}

.confetti-piece {
  position: absolute;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: confetti-burst 2.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0; /* hidden before animation starts */
}
</style>
