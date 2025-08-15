// // hooks/useCodeEditor.ts
// import { useRef, useCallback } from 'react';
// import * as monaco from 'monaco-editor';

// export interface CodeEditorRef {
//   editor: monaco.editor.IStandaloneCodeEditor | null;
//   formatCode: () => void;
//   runCode: () => void;
//   submitCode: () => void;
//   increaseFontSize: () => void;
//   decreaseFontSize: () => void;
//   resetToTemplate: () => void;
//   getValue: () => string;
//   setValue: (value: string) => void;
//   focus: () => void;
//   getSelection: () => monaco.ISelection | null;
//   setSelection: (selection: monaco.ISelection) => void;
// }

// export const useCodeEditor = (): [
//   React.RefObject<CodeEditorRef>,
//   {
//     formatCode: () => void;
//     runCode: () => void;
//     submitCode: () => void;
//     increaseFontSize: () => void;
//     decreaseFontSize: () => void;
//     resetToTemplate: () => void;
//     getValue: () => string;
//     setValue: (value: string) => void;
//     focus: () => void;
//   }
// ] => {
//   const editorRef = useRef<CodeEditorRef>(null);

//   const formatCode = useCallback(() => {
//     editorRef.current?.formatCode();
//   }, []);

//   const runCode = useCallback(() => {
//     editorRef.current?.runCode();
//   }, []);

//   const submitCode = useCallback(() => {
//     editorRef.current?.submitCode();
//   }, []);

//   const increaseFontSize = useCallback(() => {
//     editorRef.current?.increaseFontSize();
//   }, []);

//   const decreaseFontSize = useCallback(() => {
//     editorRef.current?.decreaseFontSize();
//   }, []);

//   const resetToTemplate = useCallback(() => {
//     editorRef.current?.resetToTemplate();
//   }, []);

//   const getValue = useCallback(() => {
//     return editorRef.current?.getValue() || '';
//   }, []);

//   const setValue = useCallback((value: string) => {
//     editorRef.current?.setValue(value);
//   }, []);

//   const focus = useCallback(() => {
//     editorRef.current?.focus();
//   }, []);

//   return [
//     editorRef,
//     {
//       formatCode,
//       runCode,
//       submitCode,
//       increaseFontSize,
//       decreaseFontSize,
//       resetToTemplate,
//       getValue,
//       setValue,
//       focus,
//     }
//   ];
// };