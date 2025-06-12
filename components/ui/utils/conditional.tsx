import React, { ReactNode } from 'react';

interface ShowProps {
  when: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the `when` prop
 * @example
 * <Show when={isLoading} fallback={<div>Content</div>}>
 *   <Spinner />
 * </Show>
 */
export function Show({ when, fallback = null, children }: ShowProps) {
  return <>{when ? children : fallback}</>;
}

interface ForProps<T> {
  each: T[];
  fallback?: ReactNode;
  children: (item: T, index: number) => ReactNode;
}

/**
 * Renders a list of items using a render function
 * @example
 * <For each={items} fallback={<div>No items</div>}>
 *   {(item, index) => <div key={item.id}>{item.name}</div>}
 * </For>
 */
export function For<T>({ each, fallback = null, children }: ForProps<T>) {
  if (!each || each.length === 0) return <>{fallback}</>;
  return <>{each.map((item, index) => children(item, index))}</>;
}
