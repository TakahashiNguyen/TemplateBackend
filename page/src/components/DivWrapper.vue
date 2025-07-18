<script lang="ts">
import { type VNode, defineComponent, h } from 'vue';

function unwrapContentVNodes(nodes: VNode[]): VNode[] {
	const result: VNode[] = [];

	for (const node of nodes) {
		if (
			node.key === '_content' &&
			node.children &&
			Array.isArray(node.children)
		) {
			// @ts-expect-error error-free expression
			result.push(...unwrapContentVNodes(node.children));
		} else {
			const cloned = { ...node } as VNode;
			if (node.children && Array.isArray(node.children)) {
				cloned.children = unwrapContentVNodes(node.children as VNode[]);
			}
			result.push(cloned);
		}
	}

	return result;
}

export default defineComponent({
	props: {},
	setup({}, { slots }) {
		return () => {
			return unwrapContentVNodes(slots.default?.()!).map((node) =>
				h('div', { class: ['bg--0'] }, [node]),
			);
		};
	},
});
</script>
