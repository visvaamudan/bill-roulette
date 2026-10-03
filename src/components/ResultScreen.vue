<script setup>
import { defineProps, defineEmits } from 'vue'
import StatusBar from './StatusBar.vue'

const props = defineProps({
  winner: {
    type: Number,
    required: true,
  },
})
const emit = defineEmits(['restart'])

function onRestart() {
  emit('restart')
}
</script>

<template>
  <div class="absolute inset-0 bg-[#111111] flex flex-col items-center" style="font-family: 'Poppins', sans-serif;">
    <StatusBar />
    <div class="flex-1 flex flex-col items-center justify-center px-[24px] text-center">
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
        <button class="w-[327px] h-[50px] bg-[#6028E9] text-white font-poppins font-semibold text-[17px] rounded-[16px] shadow-[0px_4px_0px_0px_#3D0E95] transition-all flex items-center justify-center">
          Rate the meal ⭐
        </button>
        <button @click="onRestart" class="w-[327px] h-[50px] border border-[#333333] text-[#BDBDBD] font-poppins font-medium text-[14px] rounded-[16px] flex items-center justify-center">
          Run it back
        </button>
      </div>
    </div>
    <!-- Simple confetti placeholder -->
    <div class="absolute inset-0 pointer-events-none">
      <div v-for="i in 40" :key="i" class="absolute" :style="{
        width: '6px',
        height: '12px',
        backgroundColor: ['#FF5257', '#007AFF', '#FDC700', '#5FB848', '#5B16E0', '#FF8A00', '#FF4FB0', '#00D1D1', '#B6E800', '#A66BFF'][i % 10] + '33',
        opacity: 0.3,
        left: Math.random() * 100 + 'vw',
        top: Math.random() * 100 + 'vh',
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: 'confetti-fall 4s linear forwards',
        animationDelay: Math.random() * 2 + 's',
      }"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes confetti-fall {
  0% { transform: translateY(-100vh) rotate(0deg); }
  100% { transform: translateY(100vh) rotate(360deg); }
}
</style>
