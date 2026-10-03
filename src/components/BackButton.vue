<template>
  <button type="button" @click="$emit('click')" class="flex items-center gap-[12px] text-[#CFCFCF] cursor-pointer active:opacity-70">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
    <span class="font-poppins text-[16px] font-normal leading-[24px]">Back</span>
  </button>
</template>

<script setup></script>
