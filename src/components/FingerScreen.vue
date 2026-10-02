<script setup>
import { ref, onUnmounted } from 'vue'

const emit = defineEmits(['back'])
const tapMode = ref(false)
const eggStage = ref('whole') // 'whole' | 'cracked' | 'fried'
const shaking = ref(false)
const popping = ref(false)

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
      timeoutIds.push(setTimeout(() => {
        eggStage.value = 'cracked'
        shaking.value = true
        timeoutIds.push(setTimeout(() => { shaking.value = false }, 200))
      }, 150))
      timeoutIds.push(setTimeout(() => {
        eggStage.value = 'fried'
        popping.value = true
        timeoutIds.push(setTimeout(() => { popping.value = false }, 250))
      }, 400))
    }
  } else {
    // Turning OFF: fried → cracked (0ms) → whole (150ms)
    eggStage.value = 'fried'
    if (prefersReducedMotion()) {
      eggStage.value = 'whole'
    } else {
      timeoutIds.push(setTimeout(() => {
        eggStage.value = 'cracked'
        shaking.value = true
        timeoutIds.push(setTimeout(() => { shaking.value = false }, 200))
      }, 0))
      timeoutIds.push(setTimeout(() => {
        eggStage.value = 'whole'
      }, 150))
    }
  }
}

onUnmounted(() => clearAllTimeouts())
</script>

<template>
  <div class="absolute inset-0 bg-[#111111] flex flex-col">

    <!-- Preload all three egg images so swaps are instant -->
    <div class="hidden" aria-hidden="true">
      <img src="/assets/egg_whole.png" alt="" />
      <img src="/assets/egg_cracked.png" alt="" />
      <img src="/assets/egg_fried.png" alt="" />
    </div>

    <!-- Top Row: Back + Tap Mode toggle -->
    <div class="absolute left-0 right-0 flex flex-row items-center justify-between px-[24px]" style="top: 74px;">

      <!-- Back button -->
      <div @click="emit('back')" class="flex items-center gap-[8px] text-[#CFCFCF] font-poppins text-[13px] cursor-pointer transition-opacity hover:opacity-80">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Back
      </div>

      <!-- Tap Mode toggle -->
      <div class="flex items-center gap-[4px]">
        <span class="font-poppins text-[12px] font-medium text-white">Tap mode:</span>

        <button
          role="switch"
          :aria-checked="tapMode"
          aria-label="Tap mode"
          @click="toggleTapMode"
          class="relative w-[48px] h-[26px] rounded-full border border-[#333333] transition-colors duration-300 cursor-pointer overflow-visible"
          :class="tapMode ? 'bg-[#7D45E6]' : 'bg-[#222222]'"
        >
          <!--
            Outer div: handles the horizontal slide (300ms ease-in-out).
            Inner div: handles the shake/pop animations independently,
            so keyframes only need rotate/scale without knowing translateX.
          -->
          <div
            class="absolute top-1/2 left-0 w-[30px] h-[30px]"
            :style="{
              transform: `translateX(${tapMode ? 18 : 0}px) translateY(-50%)`,
              transition: 'transform 300ms ease-in-out'
            }"
          >
            <div
              class="w-full h-full relative"
              :class="[shaking ? 'egg-shake' : '', popping ? 'egg-pop' : '']"
            >
              <!-- whole -->
              <img
                src="/assets/egg_whole.png"
                alt=""
                class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-[120ms]"
                :class="eggStage === 'whole' ? 'opacity-100' : 'opacity-0'"
              />
              <!-- cracked -->
              <img
                src="/assets/egg_cracked.png"
                alt=""
                class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-[120ms]"
                :class="eggStage === 'cracked' ? 'opacity-100' : 'opacity-0'"
              />
              <!-- fried -->
              <img
                src="/assets/egg_fried.png"
                alt=""
                class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-[120ms]"
                :class="eggStage === 'fried' ? 'opacity-100' : 'opacity-0'"
              />
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Center Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-[24px] text-center">
      <h1 class="font-poppins text-[20px] font-medium text-white leading-[24px] whitespace-nowrap">
        Everyone hold a finger down
      </h1>
      <p class="font-poppins text-[13px] font-[300] text-[#BDBDBD] leading-[18px] mt-[8px]">
        Need at least two to start the countdown
      </p>
    </div>

  </div>
</template>

<style scoped>
/* Shake: applied to the inner wrapper, only rotates — slide is handled by the outer div */
@keyframes egg-shake {
  0%   { transform: rotate(0deg); }
  25%  { transform: rotate(-8deg); }
  50%  { transform: rotate(8deg); }
  75%  { transform: rotate(-4deg); }
  100% { transform: rotate(0deg); }
}

/* Pop: applied to the inner wrapper, only scales */
@keyframes egg-pop {
  0%   { transform: scale(0.7); }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

.egg-shake {
  animation: egg-shake 200ms ease-in-out;
}

.egg-pop {
  animation: egg-pop 250ms ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  .egg-shake,
  .egg-pop {
    animation: none;
  }
}
</style>
