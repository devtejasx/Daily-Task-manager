import { memo, useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import MissionCard from "./MissionCard";

/** One draggable slot. The wrapper owns dnd-kit's transform so the card's
 *  own 3D-tilt transform never fights it. */
function SortableMission({ mission, cardProps, enterDelay, isDaily }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mission.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.35 : 1,
      }}
    >
      <MissionCard
        mission={mission}
        enterDelay={enterDelay}
        isDragging={isDragging}
        isDaily={isDaily}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...cardProps}
      />
    </div>
  );
}

/**
 * Mission board list.
 *
 * With `onReorder` it becomes a dnd-kit sortable grid — pointer, touch and
 * keyboard all work, and the resulting order is handed back as an ordered
 * list of ids for the reducer to persist. Without it, it renders the exact
 * same cards as a plain list (used by read-only sections like "Upcoming").
 *
 * @param {object[]} missions
 * @param {(orderedIds: string[]) => void} [onReorder]
 */
function MissionList({
  missions,
  onReorder,
  className = "grid gap-3 md:grid-cols-2",
  staggered = true,
  dailySelected = [],
  ...cardProps
}) {
  const [activeId, setActiveId] = useState(null);
  const isDaily = useCallback((id) => dailySelected.includes(id), [dailySelected]);

  const sensors = useSensors(
    // A small distance threshold keeps taps on the complete/delete buttons
    // from being swallowed by the drag gesture.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Long-press to drag on touch, so the page still scrolls normally.
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => missions.map((m) => m.id), [missions]);
  const activeMission = useMemo(
    () => missions.find((m) => m.id === activeId) ?? null,
    [missions, activeId]
  );

  const handleDragEnd = useCallback(
    (event) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const from = ids.indexOf(active.id);
      const to = ids.indexOf(over.id);
      if (from === -1 || to === -1) return;

      onReorder?.(arrayMove(ids, from, to));
    },
    [ids, onReorder]
  );

  const cards = missions.map((m, index) => (
    <SortableMission
      key={m.id}
      mission={m}
      cardProps={cardProps}
      isDaily={isDaily(m.id)}
      enterDelay={staggered ? 0.05 + index * 0.05 : 0}
    />
  ));

  if (!onReorder) {
    return (
      <div className={className}>
        <AnimatePresence mode="popLayout">
          {missions.map((m, index) => (
            <MissionCard
              key={m.id}
              mission={m}
              isDaily={isDaily(m.id)}
              enterDelay={staggered ? 0.05 + index * 0.05 : 0}
              {...cardProps}
            />
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => `Picked up mission ${active.id}.`,
          onDragOver: ({ over }) =>
            over ? `Mission moved over position ${ids.indexOf(over.id) + 1}.` : "",
          onDragEnd: ({ over }) =>
            over ? `Mission dropped at position ${ids.indexOf(over.id) + 1}.` : "Move cancelled.",
          onDragCancel: () => "Move cancelled. Mission returned to its original position.",
        },
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={className}>{cards}</div>
      </SortableContext>

      {/* Lifted card follows the cursor at full opacity */}
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
        {activeMission ? (
          <div className="rotate-1 scale-[1.02] drop-shadow-[0_20px_50px_rgba(124,58,237,0.5)]">
            <MissionCard mission={activeMission} isDragging {...cardProps} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default memo(MissionList);
