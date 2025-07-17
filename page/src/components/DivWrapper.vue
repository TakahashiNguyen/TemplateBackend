<script lang="ts">
import { defineComponent, h } from 'vue';

export default defineComponent({
	name: 'WrapperEach',
	props: {
		isSlots: { type: Boolean, default: false },
	},
	setup({ isSlots }, { slots }) {
		return () => {
			const children =
				(isSlots ? slots.default?.()[0].children : slots.default?.()) || [];

			// @ts-expect-error error-free expression
			return children.map((node) => h('div', {}, [node]));
		};
	},
});
</script>
