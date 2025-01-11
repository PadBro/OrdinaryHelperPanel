<script lang="ts" setup>
import { computed, useSlots } from "vue";
import { onClickOutside } from "@vueuse/core";
const slots = useSlots();

const props = withDefaults(
  defineProps<{ size?: "xs" | "sm" | "md" | "xl" | "2xl" | "3xl" }>(),
  {
    size: "2xl",
  },
);

const emit = defineEmits(["close"]);

const dialog = ref(null);
onClickOutside(dialog, () => {
  emit("close");
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "3xl":
      return "sm:max-w-3xl";
    case "xl":
      return "sm:max-w-xl";
    case "md":
      return "sm:max-w-md";
    case "sm":
      return "sm:max-w-sm";
    case "xs":
      return "sm:max-w-xs";
    default:
      return "sm:max-w-2xl";
  }
});
</script>

<template>
  <div
    class="relative z-10"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="fixed inset-0 bg-gray-500/75" />

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div
        data-testid="dialog-content-container-parent"
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          ref="dialog"
          data-testid="dialog-content-container"
          class="dialog-content-container relative rounded-lg bg-white text-left shadow-xl sm:my-8 sm:w-full"
          :class="sizeClass"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 w-full text-center sm:mx-4 sm:mt-0 sm:text-left">
                <h3
                  id="modal-title"
                  class="text-base font-semibold leading-6 text-gray-900"
                >
                  <slot name="title" />
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    <slot name="body" />
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="slots.footer"
            class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-10"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
