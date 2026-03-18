"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { DashboardAvancado } from "./DashboardAvancado";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              Developed by zn<br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                Franca Logs
              </span>
            </h1>
          </>
        }
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <DashboardAvancado />
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}