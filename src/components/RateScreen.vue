<script setup>
import { ref } from 'vue'

const emit = defineEmits(['close', 'submitted'])

// --- Rating stars in order: crying → plain → happy → cool → blush ---
const STARS = [
  { src: '/assets/star_crying.png', label: '1 star' },
  { src: '/assets/star_plain.png',  label: '2 stars' },
  { src: '/assets/star_happy.png',  label: '3 stars' },
  { src: '/assets/star_cool.png',   label: '4 stars' },
  { src: '/assets/star_blush.png',  label: '5 stars' },
]

// In the reference image, food has option 3 selected (index 2), service has option 5 selected (index 4)
const foodRating    = ref(3)     // 1–5
const serviceRating = ref(5)     // 1–5
const feedback      = ref('')

const loading       = ref(false)
const submitted     = ref(false)
const foodError     = ref(false)
const serviceError  = ref(false)

function selectFood(idx) {
  foodRating.value = idx + 1
  foodError.value  = false
}
function selectService(idx) {
  serviceRating.value = idx + 1
  serviceError.value  = false
}

async function onSubmit() {
  foodError.value    = foodRating.value === null
  serviceError.value = serviceRating.value === null
  if (foodError.value || serviceError.value) return

  loading.value = true
  await new Promise(r => setTimeout(r, 600))
  loading.value   = false
  emit('submitted', {
    food: foodRating.value,
    service: serviceRating.value,
    feedback: feedback.value
  })
}
</script>

<template>
  <!-- Full-container overlay + bottom-sheet modal inside the phone frame -->
  <div class="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
    <!-- Backdrop: Black 50% opacity with backdrop blur (click to dismiss) -->
    <transition name="fade-backdrop" appear>
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
        @click="emit('close')"
      ></div>
    </transition>

    <!-- Bottom Sheet Container -->
    <transition name="slide-sheet" appear>
      <div
        class="relative w-full bg-[#131313] rounded-t-[36px] overflow-hidden flex flex-col z-10 shadow-2xl"
        @click.stop
      >
        <!-- Drag handle -->
        <div class="w-full flex justify-center pt-[12px] pb-[4px]">
          <div class="w-[84px] h-[4px] bg-[#343434] rounded-full"></div>
        </div>

        <!-- SUCCESS STATE -->
        <div v-if="submitted" class="px-[24px] pt-[24px] pb-[44px] flex flex-col items-center text-center gap-[16px]">
          <div class="text-[52px] leading-none">🎉</div>
          <h2 class="font-chango text-white text-[24px] leading-[32px] tracking-[-1px]">
            Thanks for the honesty!
          </h2>
          <p class="font-poppins text-[#BDBDBD] text-[14px] leading-[20px] tracking-[-0.5px]">
            Your reward is on its way.
          </p>
          <button
            @click="emit('close')"
            class="mt-[16px] w-full font-poppins font-semibold text-white rounded-[16px] flex items-center justify-center active:scale-[0.98] transition-transform shadow-[0px_4px_0px_0px_#3D0E95]"
            style="height: 50px; font-size: 16px; background: #6028E9;"
          >
            Close
          </button>
        </div>

        <!-- FEEDBACK FORM -->
        <div v-else class="px-[24px] pt-[20px] pb-[28px] flex flex-col overflow-y-auto max-h-[78vh] hide-scrollbar">
          <!-- Header -->
          <div class="flex flex-col items-center text-center">
            <h1
              class="font-chango text-white"
              style="font-size: 28px; line-height: 40px; letter-spacing: -1.5px;"
            >
              How was it?
            </h1>
            <p
              class="font-poppins text-[#BDBDBD] mt-[6px]"
              style="font-size: 12px; line-height: 18px; letter-spacing: -0.5px;"
            >
              Two taps &amp; one honest sentence.<br>Then there’s a treat waiting
            </p>
          </div>

          <!-- 40px rhythm down to ratings -->
          <div class="mt-[40px] flex flex-col">
            <!-- Food Rating -->
            <div class="flex flex-col">
              <div class="flex items-center gap-[6px]">
                <span class="font-poppins text-[#CFCFCF] text-[12px] font-normal tracking-[-0.5px]">Food:</span>
                <span v-if="foodError" class="font-poppins text-[#FF5257] text-[12px]">Pick one ↑</span>
              </div>

              <!-- Horizontal 5-option emoji rating selector -->
              <!-- 44px circles with 24px gap = 5*44 + 4*24 = 316px (fits evenly within 327px) -->
              <div class="flex items-center justify-center gap-[24px] mt-[12px]">
                <button
                  v-for="(star, i) in STARS"
                  :key="'food-' + i"
                  @click="selectFood(i)"
                  :aria-label="star.label"
                  :aria-pressed="foodRating === i + 1"
                  class="rating-circle flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus:outline-none"
                  :class="foodRating === i + 1 ? 'rating-selected' : 'rating-unselected'"
                >
                  <img
                    :src="star.src"
                    :alt="star.label"
                    class="w-[20px] h-[20px] object-contain pointer-events-none select-none"
                  />
                </button>
              </div>
            </div>

            <!-- Vertical gap between Food rating row and Service rating row: exactly 16px -->
            <div class="mt-[16px] flex flex-col">
              <div class="flex items-center gap-[6px]">
                <span class="font-poppins text-[#CFCFCF] text-[12px] font-normal tracking-[-0.5px]">Service:</span>
                <span v-if="serviceError" class="font-poppins text-[#FF5257] text-[12px]">Pick one ↑</span>
              </div>

              <!-- Horizontal 5-option emoji rating selector -->
              <div class="flex items-center justify-center gap-[24px] mt-[12px]">
                <button
                  v-for="(star, i) in STARS"
                  :key="'service-' + i"
                  @click="selectService(i)"
                  :aria-label="star.label"
                  :aria-pressed="serviceRating === i + 1"
                  class="rating-circle flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus:outline-none"
                  :class="serviceRating === i + 1 ? 'rating-selected' : 'rating-unselected'"
                >
                  <img
                    :src="star.src"
                    :alt="star.label"
                    class="w-[20px] h-[20px] object-contain pointer-events-none select-none"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Written Feedback -->
          <div class="mt-[24px] flex flex-col gap-[10px]">
            <span class="font-poppins text-[#CFCFCF] text-[12px] font-normal tracking-[-0.5px]">Got anything to spill?</span>
            <textarea
              v-model="feedback"
              placeholder="e.g. The garlic bread changed me"
              class="feedback-textarea font-poppins w-full rounded-[20px] px-[18px] py-[14px] resize-none focus:outline-none transition-all duration-200"
              style="
                min-height: 110px;
                font-size: 15px;
                line-height: 22px;
                color: #FFFFFF;
                background: #181818;
                border: 1px solid #282828;
                caret-color: #6028E9;
              "
            ></textarea>
          </div>

          <!-- Vertical spacing between TEXTAREA → CTA: approx 50px -->
          <div class="mt-[50px] w-full">
            <button
              @click="onSubmit"
              :disabled="loading"
              class="w-full font-poppins font-medium text-[15px] leading-[18px] text-white rounded-[16px] flex items-center justify-center gap-[8px] active:scale-95 transition-all disabled:opacity-75 cursor-pointer shadow-[0px_4px_0px_0px_#3D0E95]"
              style="
                height: 50px;
                background: linear-gradient(135deg, #7026EB 0%, #5B16E0 100%);
                letter-spacing: -0.5px;
              "
            >
              <span v-if="loading" class="loading-dots">Submitting</span>
              <span v-else class="font-poppins font-medium text-[15px] leading-[18px]" style="letter-spacing: -0.5px;">Submit &amp; collect your reward’s</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
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

/* 44px x 44px circle */
.rating-circle {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.rating-unselected {
  background: #1F1F1F;
  border: 1px solid #272727;
}

.rating-selected {
  background: #FDFBF7;
  border: 1px solid #FFFFFF;
  box-shadow: 0 2px 10px rgba(255, 255, 255, 0.2);
}

.feedback-textarea::placeholder {
  color: #555555;
  font-family: 'Poppins', sans-serif;
}
.feedback-textarea:focus {
  border-color: #6028E9;
  box-shadow: 0 0 0 2px rgba(96, 40, 233, 0.25);
}

.loading-dots::after {
  content: '';
  animation: dots 1.2s steps(3, end) infinite;
}
@keyframes dots {
  0%   { content: ''; }
  33%  { content: '.'; }
  66%  { content: '..'; }
  100% { content: '...'; }
}

/* Animations for bottom sheet and backdrop */
.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.25s ease;
}
.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}

.slide-sheet-enter-active,
.slide-sheet-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-sheet-enter-from,
.slide-sheet-leave-to {
  transform: translateY(100%);
}
</style>
