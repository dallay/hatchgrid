<script setup lang="ts">
import type { BulletLegendItemInterface } from "@unovis/ts";
import { omit } from "@unovis/ts";
import { VisCrosshair, VisTooltip } from "@unovis/vue";
import { type Component, createApp } from "vue";
import { ChartTooltip } from ".";

const props = withDefaults(
	defineProps<{
		colors: string[];
		index: string;
		items: BulletLegendItemInterface[];
		customTooltip?: Component;
	}>(),
	{
		colors: () => [],
	},
);

// Use weakmap to store reference to each datapoint for Tooltip
const wm = new WeakMap();
function template(d: Record<string, unknown>) {
	if (wm.has(d)) {
		return wm.get(d);
	}

	const componentDiv = document.createElement("div");
	const omittedData = Object.entries(omit(d, [props.index])).map(
		([key, value]) => {
			const legendReference = props.items.find((i) => i.name === key);
			return { ...legendReference, value };
		},
	);
	const TooltipComponent = props.customTooltip ?? ChartTooltip;
	createApp(TooltipComponent, {
		title: (d[props.index] as string).toString(),
		data: omittedData,
	}).mount(componentDiv);
	wm.set(d, componentDiv.innerHTML);
	return componentDiv.innerHTML;
}

function color(_d: unknown, i: number) {
	return props.colors[i] ?? "transparent";
}
</script>

<template>
  <VisTooltip :horizontal-shift="20" :vertical-shift="20" />
  <VisCrosshair :template="template" :color="color" />
</template>
