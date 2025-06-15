import React from "react";
import "gantt-task-react/dist/index.css";
import { ViewMode } from "gantt-task-react";

export default function ViewSwitcher({ onViewModeChange, onViewListChange, isChecked }) {
    return (
        <div className="ViewContainer">
            <button
                className="Button"
                onClick={() => onViewModeChange(ViewMode.QuarterDay)}
            >
                Чверть дня
            </button>
            <button
                className="Button"
                onClick={() => onViewModeChange(ViewMode.HalfDay)}
            >
                половина дня
            </button>
            <button className="Button" onClick={() => onViewModeChange(ViewMode.Day)}>
                День
            </button>
            <button
                className="Button"
                onClick={() => onViewModeChange(ViewMode.Week)}
            >
                Тиждень
            </button>
            <button
                className="Button"
                onClick={() => onViewModeChange(ViewMode.Month)}
            >
                Місяць
            </button>

            <div className="Switch">
                <label className="Switch_Toggle">
                    <input
                        type="checkbox"
                        defaultChecked={isChecked}
                        onClick={() => onViewListChange(!isChecked)}
                    />
                    <span className="Slider" />
                </label>
                Показати список завданнь
            </div>
        </div>
    )
}
