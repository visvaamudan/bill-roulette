<script setup>
import { ref } from 'vue'
import StatusBar from './components/StatusBar.vue'
import FingerScreen from './components/FingerScreen.vue'
import BackButton from './components/BackButton.vue'
import ResultScreen from './components/ResultScreen.vue'

const currentScreen = ref('splash')
const winner = ref(null)

function handleWin(p) {
  winner.value = p
  currentScreen.value = 'result'
}

function resetToFinger() {
  currentScreen.value = 'finger'
  winner.value = null
}
const games = [
  { title: 'Pick a Finger', badge: 'Multi player', description: 'Everyone holds a finger on the screen. One gets chosen.', image: '/assets/game_finger.png' },
  { title: 'Spin the wheel', badge: 'Multi player', description: 'Add names, give it a spin, watch the pointer betray someone.', image: '/assets/game_wheel.png' },
  { title: 'Tic-Tac-Toe', badge: 'Two player', description: 'Everyone holds a finger on the screen. One gets chosen.', image: '/assets/game_tictactoe.png' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <!-- Mobile App Container -->
    <div class="mobile-container relative overflow-hidden shadow-2xl rounded-[40px] border-[8px] border-gray-800">
      <!-- Status Bar: overlays both screens, z-50, pointer-events-none -->
      <StatusBar />
      
      <transition name="fade">
        <!-- SPLASH SCREEN -->
        <div v-if="currentScreen === 'splash'" class="absolute inset-0 bg-background flex flex-col items-center justify-between">
          <!-- Background floating elements (using actual assets) -->
          <img :src="'/assets/book.png'" alt="Book" class="absolute top-[18%] -left-[8%] w-24 opacity-80 rotate-[-15deg] z-0 animate-float-slow" />
          <img :src="'/assets/coin.png'" alt="Coin" class="absolute top-[8%] -right-[5%] w-20 opacity-90 rotate-[10deg] z-0 animate-float-medium" />
          
          <img :src="'/assets/blue_gem.png'" alt="Blue Gem" class="absolute top-[60%] -left-[10%] w-24 opacity-90 rotate-[-25deg] z-0 animate-float-fast" />
          <img :src="'/assets/beer.png'" alt="Beer" class="absolute top-[65%] -right-[15%] w-32 opacity-90 rotate-[15deg] z-0 animate-float-medium" />
          
          <img :src="'/assets/coin.png'" alt="Coin" class="absolute bottom-[20%] left-[15%] w-12 opacity-80 rotate-[-10deg] z-0 animate-float-slow" />
          <img :src="'/assets/purple_gem.png'" alt="Purple Gem" class="absolute -bottom-[2%] -right-[5%] w-20 opacity-90 rotate-[5deg] z-0 animate-float-fast" />
          
          <!-- Overlay -->
          <div class="absolute inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-[2px] z-10 pointer-events-none"></div>
          
          <!-- Top Content -->
          <div class="w-full flex flex-col items-center pt-[160px] px-6 z-20">
            <!-- Logo Icon -->
            <img :src="'/assets/receipt_icon.png'" alt="Receipt Character" class="w-[84px] h-[84px] shadow-lg rounded-[24px]" />

            <p class="text-gray-300 font-poppins text-[14px] leading-[20px] mt-[24px]">Dinner is over</p>
            
            <h1 class="font-chango text-[36px] leading-[40px] tracking-[-1.5px] font-normal text-center text-white mt-[16px] whitespace-nowrap">
              Who's stuck<br>
              with the <span class="text-[#E7E247]">bill?</span>
            </h1>
            
            <p class="text-gray-300 font-poppins text-[14px] leading-[20px] tracking-[-0.5px] font-normal text-center mt-[16px] max-w-[280px]">
              No debates. No calculators. Just one wildly fair way to pick tonight's legend.
            </p>
          </div>

          <!-- Bottom Content -->
          <div class="absolute bottom-0 left-0 right-0 pb-[12px] z-20 flex flex-col items-center gap-[16px]">
            <button @click="currentScreen = 'games'" class="w-[327px] h-[50px] bg-[#6028E9] hover:bg-[#5020c9] text-white font-poppins font-semibold text-[17px] rounded-[16px] shadow-[0px_4px_0px_0px_#3D0E95] transition-all active:scale-95 flex items-center justify-center gap-2">
              Let's find out 🎲
            </button>
            
            <p class="text-[#88888A] text-[9px] leading-none text-center" style="font-family: 'Chalkduster', 'Comic Sans MS', cursive;">
              Takes 10 seconds. Rules one evening.
            </p>
          </div>
        </div>

        <!-- GAMES SCREEN -->
        <div v-else-if="currentScreen === 'games'" class="absolute inset-0 bg-[#111111] flex flex-col">
          <!-- Top Section -->
          <div class="px-[24px] pt-[86px]">
            <BackButton @click="currentScreen = 'splash'" />
            
            <h2 class="font-poppins text-[20px] font-semibold text-white tracking-[-0.5px] mt-[24px]">Choose your chaos</h2>
            <p class="font-poppins text-[14px] font-[300] tracking-[-0.5px] text-[#BDBDBD] mt-[8px]">Both are equally unfair. That's the point.</p>
          </div>

          <!-- Game Cards -->
          <div class="mt-[32px] px-[24px] flex flex-col gap-[12px] items-center">
          <div
            v-for="(game, index) in games"
            :key="index"
            @click="index === 0 ? currentScreen = 'finger' : null"
            class="w-[327px] min-h-[99px] rounded-[24px] bg-[#232323] border border-[#333333] overflow-hidden relative cursor-pointer transition-transform active:scale-[0.98]"
          >
              
              <div class="py-4 px-[16px] flex flex-col relative z-10">
                <div class="flex flex-row items-center gap-2 flex-nowrap w-full">
                  <h3 class="font-poppins text-[18px] font-medium text-white leading-[24px] tracking-[-0.5px] whitespace-nowrap shrink-0">{{ game.title }}</h3>
                  <span class="rounded-full border text-[10px] leading-[12px] font-medium px-[5px] py-[2px] whitespace-nowrap shrink-0"
                        :class="game.badge === 'Multi player' ? 'bg-[#CFE6FF] text-[#0B4DAA] border-[#2F6FD6]' : 'bg-[#D4F7C5] text-[#1E8A1E] border-[#3CB43C]'">
                    {{ game.badge }}
                  </span>
                </div>
                <p class="font-poppins text-[12px] leading-[17px] tracking-[-0.5px] text-[#9A9A9A] max-w-[200px] mt-[8px]">
                  {{ game.description }}
                </p>
              </div>

              <img :src="game.image" :alt="game.title" class="absolute right-[-8px] top-1/2 -translate-y-1/2 w-[82px] h-[82px] object-cover pointer-events-none z-0" />
            </div>
          </div>

          <!-- Bottom Text -->
          <div class="absolute bottom-0 left-0 right-0 pb-[12px] flex justify-center">
            <p class="text-[#88888A] text-[9px] leading-none text-center" style="font-family: 'Chalkduster', 'Comic Sans MS', cursive;">
              Takes 10 seconds. Rules one evening.
            </p>
          </div>
        </div>

        <!-- FINGER SCREEN -->
        <FingerScreen v-else-if="currentScreen === 'finger'" @back="currentScreen = 'games'" @win="handleWin" />
    <ResultScreen v-else-if="currentScreen === 'result'" :winner="winner" @restart="resetToFinger" />

      </transition>
    </div>
  </div>
</template>

<style scoped>
.mobile-container {
  width: 375px;
  height: 812px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}

.animate-float-slow {
  animation: float 6s ease-in-out infinite;
}
.animate-float-medium {
  animation: float 5s ease-in-out infinite;
  animation-delay: 1s;
}
.animate-float-fast {
  animation: float 4s ease-in-out infinite;
  animation-delay: 2s;
}
</style>
