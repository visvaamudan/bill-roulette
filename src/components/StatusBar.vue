<template>
  <div class="absolute top-0 left-0 right-0 h-[52px] z-50 pointer-events-none flex flex-row items-center justify-between pl-[32px] pr-[28px] text-white">
    <!-- Left: Time -->
    <span class="text-[16px] font-normal leading-[20px]" style="font-family: 'Inter', -apple-system, 'Helvetica Neue', sans-serif;">9:41</span>

    <!-- Right: Icons -->
    <div class="flex flex-row items-center gap-[6px]">

      <!-- Cellular Signal: 4 solid bars of increasing height -->
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="overflow-visible">
        <rect x="0"  y="8"  width="3" height="4"  rx="1" fill="currentColor"/>
        <rect x="5"  y="5"  width="3" height="7"  rx="1" fill="currentColor"/>
        <rect x="10" y="3"  width="3" height="9"  rx="1" fill="currentColor"/>
        <rect x="15" y="0"  width="3" height="12" rx="1" fill="currentColor"/>
      </svg>

      <!-- Wi-Fi: 3 arcs + dot — viewBox has 2px top padding so outer arc is never clipped -->
      <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" class="overflow-visible">
        <!-- dot -->
        <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
        <!-- small arc -->
        <path d="M5.5 10 A3.5 3.5 0 0 1 10.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <!-- medium arc -->
        <path d="M2.5 7 A7.5 7.5 0 0 1 13.5 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
        <!-- large arc — starts at y=1.5 so the stroke never clips the top edge -->
        <path d="M0.2 4 A11 11 0 0 1 15.8 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>
      </svg>

      <!-- Battery: outline + filled inner + nub -->
      <svg width="27" height="12" viewBox="0 0 27 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="overflow-visible">
        <!-- Outer shell -->
        <rect x="0.5" y="0.5" width="23" height="11" rx="3.5" stroke="currentColor" stroke-opacity="0.4" stroke-width="1"/>
        <!-- Filled inner (~70% charge) -->
        <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/>
        <!-- Nub cap on right -->
        <path d="M24.5 4.5 C25.9 4.5 26.5 5 26.5 6 C26.5 7 25.9 7.5 24.5 7.5 L24.5 4.5Z" fill="currentColor" fill-opacity="0.4"/>
      </svg>

    </div>
  </div>
</template>
