<script setup>
import { ref } from 'vue'
import StatusBar from './StatusBar.vue'

const props = defineProps({
  winner: {
    type: [Number, String],
    default: 4
  },
  reviewUrl: {
    type: String,
    default: 'https://g.page/r/review'
  }
})

const emit = defineEmits(['back', 'home'])

const voucherCode = 'CHEERS10'
const copied = ref(false)

async function copyCode() {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(voucherCode)
    } else {
      const ta = document.createElement('textarea')
      ta.value = voucherCode
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy code: ', err)
  }
}

function openGoogleReview() {
  window.open(props.reviewUrl, '_blank', 'noopener,noreferrer')
}

function downloadVoucher() {
  const a = document.createElement('a')
  a.href = '/assets/voucher_asset.png'
  a.download = `VOUCHER-${voucherCode}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<template>
  <div class="absolute inset-0 bg-[#121211] flex flex-col overflow-hidden text-white font-poppins select-none">
    <!-- Status Bar (52px absolute top) -->
    <StatusBar />

    <!-- Scrollable content area with 20px horizontal margins (voucher_asset alone fills edge-to-edge) -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar flex flex-col justify-between pt-[72px] pb-[24px] px-[20px]">
      
      <!-- Top Group: Illustration + Headlines + Voucher Card -->
      <div class="w-full flex flex-col items-center">
        
        <!-- 70px x 70px Reward Illustration (20px corner radius with 48px gift illustration inside) -->
        <img
          src="/assets/reward_icon.png"
          alt="Reward Illustration"
          class="w-[70px] h-[70px] object-contain pointer-events-none select-none shrink-0"
        />

        <!-- Main Headline (24px gap from illustration, 36px font, 40px line-height, -1px letter-spacing) -->
        <h1
          class="font-chango text-center text-white mt-[24px]"
          style="font-size: 36px; line-height: 40px; letter-spacing: -1px;"
        >
          A <span class="text-[#E7E247]">treat</span> for<br />
          the brave.
        </h1>

        <!-- Supporting Description (12px gap from headline, 13px font, 20px line-height, -0.5px letter-spacing) -->
        <p
          class="font-poppins text-center text-[#B0B0B0] mt-[12px]"
          style="font-size: 13px; line-height: 20px; letter-spacing: -0.5px; font-weight: 400;"
        >
          Player {{ props.winner || 4 }}, this one’s on the house.<br />
          You played. You survived. You earned it.
        </p>

        <!-- VOUCHER TICKET SECTION (voucher_asset crosses the frame margins to fill end-to-end) -->
        <div class="relative -mx-[20px] w-[calc(100%+40px)] aspect-[1484/1172] my-[24px] select-none">
          
          <!-- Visual style background: voucher_asset.png -->
          <img
            src="/assets/voucher_asset.png"
            alt=""
            class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-0"
          />

          <!-- Inside elements: Top Section (24px vertical spacing to dotted line, 28px horizontal padding) -->
          <div
            class="absolute left-0 right-0 z-10 px-[28px] flex flex-col items-center text-center"
            style="bottom: calc(62.16% + 24px);"
          >
            <span class="font-poppins text-[#888888] text-[12px] font-normal leading-[16px]">
              Voucher
            </span>
            <h2 class="font-poppins text-white text-[15px] font-normal leading-[22px] mt-[8px]">
              10% off your next visit
            </h2>
          </div>

          <!-- Inside elements: Lower Section (24px vertical spacing from dotted line, 28px horizontal padding) -->
          <div
            class="absolute left-0 right-0 z-10 px-[28px] flex flex-col items-center text-center"
            style="top: calc(37.84% + 24px);"
          >
            <span class="font-poppins text-[#888888] text-[12px] font-normal leading-[16px]">
              Show this code to staff
            </span>

            <!-- Code container (CHEERS10, copy icon, and inline copy feedback inside the field) -->
            <div
              @click="copyCode"
              class="w-full h-[46px] rounded-[14px] bg-[#141414] border border-[#282828] mt-[10px] px-[16px] flex items-center justify-between cursor-pointer active:scale-[0.99] transition-transform select-none"
            >
              <!-- Left spacer to balance icon and keep code centered -->
              <div class="w-[20px]"></div>

              <!-- Centered Voucher Code -->
              <span class="font-poppins text-white text-[15px] font-normal tracking-[1.5px] ml-[4px]">
                {{ voucherCode }}
              </span>

              <!-- Right Action: Copy Icon or Inline Copied State -->
              <div class="flex items-center gap-[4px] shrink-0">
                <span v-if="copied" class="font-poppins text-[11px] font-medium text-[#4ADE80] transition-opacity">
                  Copied!
                </span>
                <svg
                  v-else
                  class="w-[16px] h-[16px] text-[#888888] hover:text-white transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </div>
            </div>

            <!-- Bottom text: 12px, -0.5px letter spacing, 8px spacing around middle dot -->
            <p
              class="font-poppins text-[#888888] font-normal mt-[12px]"
              style="font-size: 12px; line-height: 18px; letter-spacing: -0.5px;"
            >
              <span>Valid until 12th Oct 2026</span><span class="inline-block mx-[8px]">•</span><span>One use per table</span>
            </p>
          </div>

        </div>

      </div>

      <!-- Bottom CTAs: Aligned with 20px horizontal margins, 24px bottom spacing, 16px horizontal gap, equal 50px height -->
      <div class="w-full flex items-center gap-[16px] mt-[24px]">
        <!-- SECONDARY CTA: Google review (15px font, #B5B5B5, -0.5px letter spacing, medium weight, 18px line height) -->
        <button
          @click="openGoogleReview"
          class="flex-1 h-[50px] rounded-[16px] border border-[#383838] bg-[#141414] hover:bg-[#1A1A1A] font-poppins font-medium text-[15px] leading-[18px] flex items-center justify-center gap-[8px] active:scale-95 transition-all cursor-pointer text-[#B5B5B5]"
          style="color: #B5B5B5; letter-spacing: -0.5px; line-height: 18px;"
        >
          <!-- Google "G" Logo -->
          <svg class="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span class="font-poppins font-medium text-[15px] leading-[18px]" style="color: #B5B5B5; letter-spacing: -0.5px;">Google review</span>
        </button>

        <!-- PRIMARY CTA: Download (White text, purple gradient, 50px height, 15px font, medium weight, -0.5px letter spacing, 18px line height, 3D shadow) -->
        <button
          @click="downloadVoucher"
          class="flex-1 h-[50px] rounded-[16px] text-white font-poppins font-medium text-[15px] leading-[18px] flex items-center justify-center gap-[8px] active:scale-95 transition-all shadow-[0px_4px_0px_0px_#3D0E95] cursor-pointer"
          style="background: linear-gradient(135deg, #7026EB 0%, #5B16E0 100%); color: #FFFFFF; letter-spacing: -0.5px; line-height: 18px;"
        >
          <!-- Download icon -->
          <svg
            class="w-[18px] h-[18px] shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span class="font-poppins font-medium text-[15px] leading-[18px]" style="color: #FFFFFF; letter-spacing: -0.5px;">Download</span>
        </button>
      </div>

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
