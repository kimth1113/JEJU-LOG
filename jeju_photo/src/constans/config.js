import {
  GalleryVertical,
  LayoutList,
  Grid2X2,
  Smile,
  Heart,
  Users,
  Map,
  Star,
  PenTool,
} from "lucide-react";

export const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
export const API_KEY = ""; // Canvas 환경에서 자동 제공

export const templates = [
  {
    id: 1,
    count: 1,
    name: "한 장 프레임",
    icon: GalleryVertical,
    layoutClass: "grid-col-1 grid-row-1",
  },
  {
    id: 2,
    count: 2,
    name: "두 장 프레임",
    icon: GalleryVertical,
    layoutClass: "grid-col-1 grid-row-2",
  },
  {
    id: 3,
    count: 3,
    name: "세 장 프레임",
    icon: LayoutList,
    layoutClass: "grid-col-1 grid-row-3",
  },
  {
    id: 4,
    count: 4,
    name: "네 장 프레임",
    icon: Grid2X2,
    layoutClass: "grid-col-2 grid-row-2",
  },
];

export const contentOptions = [
  {
    name: "혼자 여행",
    icon: Smile,
    prompt: "혼자만의 여정을 담은 감성적인 여행 일기 스타일의 글",
  },
  {
    name: "커플 여행",
    icon: Heart,
    prompt: "사랑하는 연인과의 달콤한 추억을 담은 로맨틱한 시 스타일의 글",
  },
  {
    name: "가족 여행",
    icon: Users,
    prompt:
      "가족과의 소중하고 따뜻한 순간을 기념하는 따뜻한 에세이 스타일의 글",
  },
  {
    name: "친구 여행",
    icon: Map,
    prompt:
      "친구들과의 활기차고 유쾌한 우정을 노래하는 짧은 노래 가사 스타일의 글",
  },
  {
    name: "시 스타일",
    icon: PenTool,
    prompt: "사진에서 느껴지는 분위기를 기반으로 한 짧고 아름다운 시",
  },
  {
    name: "노래 가사 스타일",
    icon: Star,
    prompt: "사진이 주제인 것처럼 느껴지는 트렌디하고 짧은 노래 가사",
  },
  {
    name: "공주님 스타일",
    icon: Heart,
    prompt: "로열티가 느껴지는 우아하고 귀여운 공주님 스타일의 코멘트",
  },
  {
    name: "왕자님 스타일",
    icon: Smile,
    prompt: "멋지고 늠름한 왕자님 스타일로 위트를 더한 코멘트",
  },
];
