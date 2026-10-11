<script setup>
import { ref, computed } from 'vue'
import BackButton from './BackButton.vue'

const emit = defineEmits(['back', 'win'])

// Characters system
// Player 1 default Egg, Player 2 default Hen using provided PNG assets
const CHARACTERS = {
  egg: {
    id: 'egg',
    name: 'Egg',
    image: '/assets/xo_egg.png',
  },
  hen: {
    id: 'hen',
    name: 'Hen',
    image: '/assets/xo_hen.png',
  }
}

// Game configuration
const bestOfOptions = [3, 5]
const bestOf = ref(3)
const showDropdown = ref(false)

// Players & Character Assignment
const p1Char = ref('egg') // 'egg' | 'hen'
const p2Char = ref('hen') // 'hen' | 'egg'

// Match Scores
const p1Score = ref(0)
const p2Score = ref(0)
const currentRound = ref(1)

// Round State
const board = ref(Array(9).fill(null)) // null | 'p1' | 'p2'
const activePlayer = ref('p1') // 'p1' | 'p2'
const winningLine = ref(null) // null | combo object
const roundResult = ref(null) // null | 'p1' | 'p2' | 'draw'
const matchWinner = ref(null) // null | 'p1' | 'p2'
const isTransitioning = ref(false)

// Needed wins for the current Best of format
const winsNeeded = computed(() => Math.ceil(bestOf.value / 2))

// Winning combinations
const WINNING_COMBOS = [
  // Rows
  { line: [0, 1, 2], type: 'row', index: 0 },
  { line: [3, 4, 5], type: 'row', index: 1 },
  { line: [6, 7, 8], type: 'row', index: 2 },
  // Columns
  { line: [0, 3, 6], type: 'col', index: 0 },
  { line: [1, 4, 7], type: 'col', index: 1 },
  { line: [2, 5, 8], type: 'col', index: 2 },
  // Diagonals
  { line: [0, 4, 8], type: 'diag', index: 0 }, // top-left to bottom-right
  { line: [2, 4, 6], type: 'diag', index: 1 }, // top-right to bottom-left
]

// Status message in score container:
// Initial: "Let's Start" in #6F6F6F
// During game / between rounds: current round info e.g. "1 of 3", "2 of 3"
const statusMessage = computed(() => {
  if (matchWinner.value) {
    return matchWinner.value === 'p1' ? 'Player 1 Wins!' : 'Player 2 Wins!'
  }
  if (roundResult.value === 'draw') {
    return "It's a draw!"
  }
  if (roundResult.value === 'p1') {
    return 'Player 1 wins round!'
  }
  if (roundResult.value === 'p2') {
    return 'Player 2 wins round!'
  }
  const movesCount = board.value.filter(Boolean).length
  if (movesCount === 0 && currentRound.value === 1) {
    return "Let's Start"
  }
  return `${currentRound.value} of ${bestOf.value}`
})

// Cell Click Handler
function handleCellClick(index) {
  if (board.value[index] || roundResult.value || isTransitioning.value || matchWinner.value) {
    return
  }

  // Place current player's move
  board.value[index] = activePlayer.value

  // Check for win
  const winnerCombo = checkWin(board.value)
  if (winnerCombo) {
    handleRoundWin(winnerCombo, activePlayer.value)
    return
  }

  // Check for draw (all 9 filled)
  if (board.value.every(cell => cell !== null)) {
    handleRoundDraw()
    return
  }

  // Switch turn
  activePlayer.value = activePlayer.value === 'p1' ? 'p2' : 'p1'
}

function checkWin(currentBoard) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo.line
    if (
      currentBoard[a] &&
      currentBoard[a] === currentBoard[b] &&
      currentBoard[a] === currentBoard[c]
    ) {
      return combo
    }
  }
  return null
}

function handleRoundWin(combo, winnerPlayer) {
  winningLine.value = combo
  roundResult.value = winnerPlayer
  isTransitioning.value = true

  // Update Score
  if (winnerPlayer === 'p1') {
    p1Score.value++
  } else {
    p2Score.value++
  }

  // Check if overall match is won
  if (p1Score.value >= winsNeeded.value) {
    matchWinner.value = 'p1'
    isTransitioning.value = false
    return
  }
  if (p2Score.value >= winsNeeded.value) {
    matchWinner.value = 'p2'
    isTransitioning.value = false
    return
  }

  // Otherwise, queue transition to next round
  setTimeout(() => {
    startNextRound()
  }, 2200)
}

function handleRoundDraw() {
  roundResult.value = 'draw'
  isTransitioning.value = true

  setTimeout(() => {
    startNextRound()
  }, 2000)
}

function startNextRound() {
  board.value = Array(9).fill(null)
  winningLine.value = null
  roundResult.value = null
  isTransitioning.value = false
  currentRound.value++
  // Alternate who starts
  activePlayer.value = currentRound.value % 2 === 1 ? 'p1' : 'p2'
}

function resetEntireMatch() {
  p1Score.value = 0
  p2Score.value = 0
  currentRound.value = 1
  board.value = Array(9).fill(null)
  winningLine.value = null
  roundResult.value = null
  matchWinner.value = null
  isTransitioning.value = false
  activePlayer.value = 'p1'
}

function switchCharacters() {
  if (isTransitioning.value) return
  const temp = p1Char.value
  p1Char.value = p2Char.value
  p2Char.value = temp
}

function selectBestOf(val) {
  bestOf.value = val
  showDropdown.value = false
  resetEntireMatch()
}

function handleWhoPays() {
  if (matchWinner.value) {
    const billPayer = matchWinner.value === 'p1' ? 2 : 1
    emit('win', billPayer)
  }
}
</script>

<template>
  <div class="absolute inset-0 bg-[#0E0E0E] flex flex-col overflow-hidden text-white font-poppins select-none" @click="showDropdown = false">
    
    <!-- TOP NAVIGATION (Back arrow on Left, Plain text Best of 3 + chevron on Right) -->
    <div class="px-[24px] pt-[86px] flex items-center justify-between shrink-0 z-30">
      <BackButton @click="emit('back')" />

      <!-- Best of dropdown: Plain text 12px Medium, NO button or container background -->
      <div class="relative" @click.stop>
        <button
          @click="showDropdown = !showDropdown"
          type="button"
          class="flex items-center gap-[4px] text-[12px] font-medium text-[#CFCFCF] cursor-pointer hover:text-white transition-colors bg-transparent border-0 p-0 focus:outline-none"
        >
          <span>Best of {{ bestOf }}</span>
          <svg
            class="w-[12px] h-[12px] text-[#A0A0A0] transition-transform duration-200"
            :class="{ 'rotate-180': showDropdown }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div
          v-if="showDropdown"
          class="absolute right-0 top-[26px] w-[110px] rounded-[14px] bg-[#1C1C1E] border border-[#2E2E32] shadow-2xl py-[6px] z-40 overflow-hidden"
        >
          <button
            v-for="opt in bestOfOptions"
            :key="opt"
            @click="selectBestOf(opt)"
            type="button"
            class="w-full px-[14px] py-[8px] text-left text-[13px] font-poppins transition-colors flex items-center justify-between"
            :class="bestOf === opt ? 'text-[#6028E9] font-semibold bg-[#26262B]' : 'text-[#CFCFCF] hover:bg-[#26262B]'"
          >
            <span>Best of {{ opt }}</span>
            <span v-if="bestOf === opt" class="text-[12px]">✓</span>
          </button>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT (~80px vertical space between top navigation row and player controls) -->
    <div class="flex-1 overflow-y-auto hide-scrollbar px-[24px] pt-[80px] pb-[96px] flex flex-col items-center">
      
      <!-- PLAYER / CHARACTER SECTION: [ Player 1: 133.5x44 ] 8px [ Swap: 44x44 ] 8px [ Player 2: 133.5x44 ] -->
      <div class="flex items-center justify-center gap-[8px] shrink-0">
        
        <!-- Player 1 Card (133.5px wide x 44px high, Rounded 16px, Text "Player: 1", #CFCFCF, Egg on right) -->
        <div
          class="w-[133.5px] h-[44px] rounded-[16px] bg-[#18181A] border border-[#262628] px-[12px] flex items-center justify-between shrink-0"
        >
          <span
            class="font-poppins text-[#CFCFCF] font-medium"
            style="font-size: 14px; line-height: 20px; letter-spacing: -0.5px;"
          >
            Player: 1
          </span>
          <div class="w-[28px] h-[28px] flex items-center justify-center shrink-0">
            <img
              :src="CHARACTERS[p1Char].image"
              :alt="CHARACTERS[p1Char].name"
              class="w-full h-full object-contain pointer-events-none select-none"
            />
          </div>
        </div>

        <!-- Middle Swap Card (44px x 44px, Rounded 16px, centered swap icon, 8px gaps) -->
        <button
          @click="switchCharacters"
          type="button"
          aria-label="Switch characters"
          class="w-[44px] h-[44px] shrink-0 rounded-[16px] bg-[#18181A] border border-[#262628] flex items-center justify-center text-[#B0B0B0] hover:text-white active:scale-95 transition-all cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 7h12m0 0l-4-4m4 4l-4 4" />
            <path d="M16 17H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <!-- Player 2 Card (133.5px wide x 44px high, Rounded 16px, Text "Player: 2", #CFCFCF, Hen on right) -->
        <div
          class="w-[133.5px] h-[44px] rounded-[16px] bg-[#18181A] border border-[#262628] px-[12px] flex items-center justify-between shrink-0"
        >
          <span
            class="font-poppins text-[#CFCFCF] font-medium"
            style="font-size: 14px; line-height: 20px; letter-spacing: -0.5px;"
          >
            Player: 2
          </span>
          <div class="w-[28px] h-[28px] flex items-center justify-center shrink-0">
            <img
              :src="CHARACTERS[p2Char].image"
              :alt="CHARACTERS[p2Char].name"
              class="w-full h-full object-contain pointer-events-none select-none"
            />
          </div>
        </div>

      </div>

      <!-- TIC-TAC-TOE GAME AREA (Exactly 16px vertical spacing from player row, 327px x 350px, rounded-[28px]) -->
      <div class="relative w-[327px] h-[350px] rounded-[28px] bg-[#232322] border border-[#2e2e2e] mt-[16px] shrink-0 flex items-center justify-center overflow-hidden">
        
        <!-- Four hand-drawn board lines positioned accurately -->
        <!-- Vertical line 1 (xo_line1.png) -->
        <img
          src="/assets/xo_line1.png"
          alt=""
          class="absolute pointer-events-none select-none z-10"
          style="left: 111px; top: 45.5px; width: 8.25px; height: 260px;"
        />
        <!-- Vertical line 2 (xo_line2.png) -->
        <img
          src="/assets/xo_line2.png"
          alt=""
          class="absolute pointer-events-none select-none z-10"
          style="left: 211.75px; top: 46px; width: 7px; height: 260px;"
        />
        <!-- Horizontal line 1 (xo_line3.png) -->
        <img
          src="/assets/xo_line3.png"
          alt=""
          class="absolute pointer-events-none select-none z-10"
          style="left: 14px; top: 122px; width: 300px; height: 7px;"
        />
        <!-- Horizontal line 2 (xo_line4.png) -->
        <img
          src="/assets/xo_line4.png"
          alt=""
          class="absolute pointer-events-none select-none z-10"
          style="left: 15.25px; top: 222px; width: 300px; height: 7px;"
        />

        <!-- 3x3 Playable Clickable Cells Grid overlaying the hand-drawn board -->
        <div class="grid grid-cols-3 grid-rows-3 w-full h-full z-20">
          <div
            v-for="(cell, idx) in board"
            :key="idx"
            @click="handleCellClick(idx)"
            class="flex items-center justify-center cursor-pointer transition-all active:scale-95 select-none"
            :class="{ 'cursor-not-allowed': cell || roundResult || matchWinner }"
          >
            <!-- Placed Player 1 Character (Egg: xo_egg.png) -->
            <transition name="pop-in" appear>
              <div v-if="cell === 'p1'" class="w-[64px] h-[64px] flex items-center justify-center p-1">
                <img
                  :src="CHARACTERS[p1Char].image"
                  :alt="CHARACTERS[p1Char].name"
                  class="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
                />
              </div>
            </transition>

            <!-- Placed Player 2 Character (Hen: xo_hen.png) -->
            <transition name="pop-in" appear>
              <div v-if="cell === 'p2'" class="w-[64px] h-[64px] flex items-center justify-center p-1">
                <img
                  :src="CHARACTERS[p2Char].image"
                  :alt="CHARACTERS[p2Char].name"
                  class="w-full h-full object-contain pointer-events-none select-none drop-shadow-md"
                />
              </div>
            </transition>
          </div>
        </div>

        <!-- WINNING STRIKE ANIMATION OVERLAY -->
        <svg
          v-if="winningLine"
          class="absolute inset-0 w-full h-full pointer-events-none z-30"
          viewBox="0 0 327 350"
        >
          <!-- Horizontal Row Wins -->
          <line
            v-if="winningLine.type === 'row' && winningLine.index === 0"
            x1="24" y1="62" x2="303" y2="62"
            class="strike-line"
          />
          <line
            v-if="winningLine.type === 'row' && winningLine.index === 1"
            x1="24" y1="175" x2="303" y2="175"
            class="strike-line"
          />
          <line
            v-if="winningLine.type === 'row' && winningLine.index === 2"
            x1="24" y1="287" x2="303" y2="287"
            class="strike-line"
          />

          <!-- Vertical Column Wins -->
          <line
            v-if="winningLine.type === 'col' && winningLine.index === 0"
            x1="55" y1="24" x2="55" y2="326"
            class="strike-line"
          />
          <line
            v-if="winningLine.type === 'col' && winningLine.index === 1"
            x1="163.5" y1="24" x2="163.5" y2="326"
            class="strike-line"
          />
          <line
            v-if="winningLine.type === 'col' && winningLine.index === 2"
            x1="272" y1="24" x2="272" y2="326"
            class="strike-line"
          />

          <!-- Diagonal Wins -->
          <line
            v-if="winningLine.type === 'diag' && winningLine.index === 0"
            x1="35" y1="38" x2="292" y2="312"
            class="strike-line"
          />
          <line
            v-if="winningLine.type === 'diag' && winningLine.index === 1"
            x1="292" y1="38" x2="35" y2="312"
            class="strike-line"
          />
        </svg>

      </div>

      <!-- SCORE / GAME STATUS SECTION (Single rounded container below board, exactly 16px vertical spacing) -->
      <div class="w-[327px] h-[44px] rounded-[16px] bg-[#18181A] border border-[#262628] px-[16px] flex items-center justify-between mt-[16px] shrink-0">
        <!-- Left: "Score: 00" in 12px, #CFCFCF -->
        <span class="font-poppins text-[#CFCFCF] text-[12px] font-normal tracking-[-0.2px] shrink-0">
          Score: {{ p1Score < 10 ? '0' + p1Score : p1Score }}
        </span>

        <!-- Center: Status text in 12px, #6F6F6F -->
        <span class="font-poppins text-[#6F6F6F] text-[12px] font-normal tracking-[-0.3px] px-[8px] text-center truncate">
          {{ statusMessage }}
        </span>

        <!-- Right: "Score: 00" in 12px, #CFCFCF -->
        <span class="font-poppins text-[#CFCFCF] text-[12px] font-normal tracking-[-0.2px] shrink-0">
          Score: {{ p2Score < 10 ? '0' + p2Score : p2Score }}
        </span>
      </div>

    </div>

    <!-- Fixed Bottom Primary CTA: "Who pays?" (50px height, rounded 16px, 16px font, active:scale-95) -->
    <div
      class="absolute left-0 right-0 bottom-0 px-[24px] pb-[24px] pt-[16px] z-30 pointer-events-auto"
      style="background: linear-gradient(to top, #0E0E0E 80%, rgba(14, 14, 14, 0) 100%);"
    >
      <button
        @click="handleWhoPays"
        :disabled="!matchWinner"
        type="button"
        class="w-full h-[50px] font-poppins font-medium text-[15px] leading-[18px] text-white rounded-[16px] flex items-center justify-center transition-all select-none"
        :class="[
          matchWinner
            ? 'bg-[#6028E9] shadow-[0px_4px_0px_0px_#3D0E95] hover:bg-[#5020c9] active:scale-95 cursor-pointer'
            : 'bg-[#222226] text-[#707076] border border-[#2E2E34] cursor-not-allowed opacity-80'
        ]"
        style="letter-spacing: -0.5px;"
      >
        <span class="font-poppins font-medium text-[15px] leading-[18px]" style="letter-spacing: -0.5px;">Who pays?</span>
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

/* Character pop-in animation */
.pop-in-enter-active {
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.pop-in-enter-from {
  opacity: 0;
  transform: scale(0.4);
}
.pop-in-enter-to {
  opacity: 1;
  transform: scale(1);
}

/* SVG Strike line animation */
.strike-line {
  stroke: #FCD535;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-dasharray: 450;
  stroke-dashoffset: 450;
  animation: drawStrike 0.45s ease-out forwards;
  filter: drop-shadow(0 0 6px rgba(252, 213, 53, 0.5));
}

@keyframes drawStrike {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
