
const vscode = require(`vscode`);
const assert = require(`assert`);

const Parser = require(`../../src/language/parser`);
const Linter = require(`../../src/language/linter`);

const URI = vscode.Uri.parse(`source.rpgle`);

module.exports = {
  /**
   * Variable definition test
   */
  test1: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable Char(20);`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.variables[0].position.line, 1, `Index of 1 expected`);
  },

  /**
   * Multiple variable definition test
   */
  test2: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable Char(20);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 2, `Expect length of 2`);
    assert.strictEqual(cache.variables[0].position.line, 1, `Index of 1 expected`);
    assert.strictEqual(cache.variables[1].position.line, 3, `Index of 3 expected`);
  },

  /**
   * Variable definition and struct definition test
   */
  test3: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      `Dcl-Ds astructure qualified;`,
      `  Subitem1 Char(20);`,
      `  Subitem2 Char(20);`,
      `End-ds;`,
      `Dcl-s MyVariable Char(20);`,
      `//Yes`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 2, `Expect length of 2`);
    assert.strictEqual(cache.structs.length, 1, `Expect length of 1`);
    
    assert.strictEqual(cache.structs[0].subItems.length, 2, `Expect length of 2 subitems`);

    assert.strictEqual(cache.variables[0].position.line, 1, `Index of 1 expected`);
    assert.strictEqual(cache.variables[1].position.line, 6, `Index of 6 expected`);
    assert.strictEqual(cache.structs[0].position.line, 2, `Index of 2 expected`);
  },

  /**
   * Variable and subroutine definition test
   * */
  test4: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      ``,
      `Begsr theSubroutine;`,
      `  MyVariable2 = 'Hello world';`,
      `Endsr;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.subroutines.length, 1, `Expect length of 1`);

    assert.strictEqual(cache.variables[0].position.line, 1, `Index of 1 expected`);
    assert.strictEqual(cache.subroutines[0].range.start, 4, `Index of 4 expected`);
  },

  /**
   * Variable and procedure definition test
   */ 
  test5: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  MyVariable2 = 'Hello world';`,
      `End-Proc;`,
      ``,
      `Dcl-Proc setValue;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `  MyVariable2 = newValue;`,
      `End-Proc;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 2, `Expect length of 2`);

    assert.strictEqual(cache.variables[0].position.line, 2, `Index of 2 expected`);
    assert.strictEqual(cache.procedures[0].position.line, 4, `Index of 4 expected`);
    assert.strictEqual(cache.procedures[1].position.line, 8, `Index of 8 expected`);

    assert.strictEqual(cache.procedures[0].subItems.length, 0, `Expect length of 0`);
    assert.strictEqual(cache.procedures[1].subItems.length, 1, `Expect length of 1`);
  },

  test6: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-Pr TheProcedure;`,
      `  parmA char(20);`,
      `End-Pr`,
      ``,
      `MyVariable2 = 'Hello world';`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);
  },

  /**
   * Test procedure length.
   * When Procedure is defined, the prototype is overridden.
   */
  test7: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Dcl-Pr TheProcedure;`,
      `  parmA char(20);`,
      `End-Pr`,
      ``,
      `Dcl-S theVar Char(20);`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `  theVar = newValue;`,
      `End-Proc;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures[0].subItems.length, 1, `Expect length of 1`);
  },

  /**
   * Constant definition test
   * */
  test8: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-C theConstant 'Hello world';`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.constants.length, 1, `Expect length of 1`);
  },

  /**
   * Check that local variables are not in global scope
   */
  test9: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-C theConstant 'Hello world';`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `  Dcl-S localVar Char(20);`,
      `  localVar = newValue;`,
      `  MyVariable2 = localVar;`,
      `End-Proc;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.constants.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures[0].subItems.length, 1, `Expect length of 1`);
  },

  /**
   * Test copybook
   * */
  test10: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DftActGrp(*No);`,
      ``,
      `/copy './tests/rpgle/copy1.rpgle'`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-C theConstant 'Hello world';`,
      ``,
      `CallP theExtProcedure(myVariable);`,
      ``,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.constants.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures[0].subItems.length, 1, `Expect length of 1`);

    assert.strictEqual(cache.procedures[0].position.path, `'./tests/rpgle/copy1.rpgle'`, `Path is incorrect`);
    assert.strictEqual(cache.procedures[0].position.line, 2, `Index of 3 expected`);
  },


  /**
   * Test many copybooks
   * */
  test11: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DftActGrp(*No);`,
      ``,
      `/copy './tests/rpgle/copy1.rpgle'`,
      `/include './tests/rpgle/copy2.rpgle'`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-C theConstant 'Hello world';`,
      ``,
      `CallP theExtProcedure(myVariable);`,
      ``,
      `TheStruct.SubItem = theConstant;`,
      ``,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.constants.length, 2, `Expect length of 2`);
    assert.strictEqual(cache.structs.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.structs[0].subItems.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures[0].subItems.length, 1, `Expect length of 1`);
  },

  test12: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DftActGrp(*No);`,
      ``,
      `/copy './tests/rpgle/copy1.rpgle'`,
      ``,
      `Dcl-S globalVar Char(20);`,
      ``,
      `Dcl-C theConstant 'Hello world';`,
      ``,
      `globalVar = theConstant;`,
      ``,
      `theLocalProc(globalVar);`,
      ``,
      `Return;`,
      ``,
      `Dcl-Proc theLocalProc;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `  Dcl-S localVar Char(20);`,
      `  localVar = %trimr(newValue) + '!';`,
      `  globalVar = localVar;`,
      `End-Proc;`,
      ``
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);

    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.constants.length, 1, `Expect length of 1`);

    // One prototype and one declared
    assert.strictEqual(cache.procedures.length, 2, `Expect length of 2`);

    // Valid names
    assert.strictEqual(cache.procedures[0].name, `theLocalProc`, `Expect valid name`);
    assert.strictEqual(cache.procedures[1].name, `theExtProcedure`, `Expect valid name`);

    // Has a parameter
    assert.strictEqual(cache.procedures[0].subItems.length, 1, `Expect length of 1`);

    // Has a local scope
    assert.strictEqual(cache.procedures[0].scope !== undefined, true, `Should have a scope`);

    // Should have a local variable
    assert.strictEqual(cache.procedures[0].scope.variables.length, 1, `Expect length of 1`);
  },

  linter1_indent: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `// My variable`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `  // Inside if`,
      `MyVariable2 = 'Hello world';`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 1, `Expect length of 1`);
    assert.strictEqual(indentErrors[0].line, 11, `Index of 9 expected`);
    assert.strictEqual(indentErrors[0].currentIndent, 0, `Value of 0 expected`);
    assert.strictEqual(indentErrors[0].expectedIndent, 2, `Value of 2 expected`);
  },

  /**
   * Testing spaces before the EOL
   */
  linter1_1_indent: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `// Prototype`,
      `Dcl-Pr printf Int(10) ExtProc('printf');`,
      `  format Pointer Value Options(*String); `, //This space at the end was causing an indent error on the next line
      `END-PR;`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `  // Inside if`,
      `  MyVariable2 = 'Hello world';`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 0, `Expect length of 0`);
  },

  linter2_indent: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `  // Inside if`,
      `MyVariable2 = 'Hello world';`,
      `  Select;`,
      `    When myVariable2 = *blank;`,
      `      // First when`,
      `      MyVariable2 = 'Still blank?';`,
      `    When myVariable2 = 'YOYOYO';`,
      `      // Second when`,
      `        MyVariable2 = 'YOYOYO';`,
      `  Endsl;`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 2, `Expect length of 2`);

    assert.strictEqual(indentErrors[0].line, 10, `Index of 9 expected`);
    assert.strictEqual(indentErrors[0].currentIndent, 0, `Value of 0 expected`);
    assert.strictEqual(indentErrors[0].expectedIndent, 2, `Value of 2 expected`);

    assert.strictEqual(indentErrors[1].line, 17, `Index of 14 expected`);
    assert.strictEqual(indentErrors[1].currentIndent, 8, `Value of 8 expected`);
    assert.strictEqual(indentErrors[1].expectedIndent, 6, `Value of 6 expected`);
  },

  linter3_indent: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `MyVariable2 = 'Hello world';`,
      `  Select;`,
      `    When myVariable2 = *blank;`,
      `      MyVariable2 = 'Still blank?';`,
      `    When myVariable2 = 'YOYOYO';`,
      `        MyVariable2 = 'YOYOYO';`,
      `  Endsl;`,
      `Endif;`,
      ``,
      `  MyVariable2 = 'YOYOYO';`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 3, `Expect length of 3`);
    
    assert.strictEqual(indentErrors[0].line, 9, `Index of 9 expected`);
    assert.strictEqual(indentErrors[0].currentIndent, 0, `Value of 0 expected`);
    assert.strictEqual(indentErrors[0].expectedIndent, 2, `Value of 2 expected`);

    assert.strictEqual(indentErrors[1].line, 14, `Index of 14 expected`);
    assert.strictEqual(indentErrors[1].currentIndent, 8, `Value of 8 expected`);
    assert.strictEqual(indentErrors[1].expectedIndent, 6, `Value of 6 expected`);

    assert.strictEqual(indentErrors[2].line, 18, `Index of 18 expected`);
    assert.strictEqual(indentErrors[2].currentIndent, 2, `Value of 2 expected`);
    assert.strictEqual(indentErrors[2].expectedIndent, 0, `Value of 0 expected`);
  },

  linter4: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = '';`,
      ``,
      `If myVariable2 = '';`,
      `  MyVariable2 = 'Hello world';`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      RequireBlankSpecial: true
    }, cache);

    assert.strictEqual(errors.length, 2, `Expect length of 2`);

    assert.strictEqual(errors[0].type, `RequireBlankSpecial`, `Expect RequireBlankSpecial`);
    assert.strictEqual(errors[0].range.start.line, 6, `Index of 6 expected`);
    assert.strictEqual(errors[0].offset.position, 14, `Index of 14 expected`);
    assert.strictEqual(errors[0].offset.length, 16, `Index of 16 expected`);
    assert.strictEqual(errors[0].newValue, `*BLANK`, `Value of *BLANK expected`);

    assert.strictEqual(errors[1].type, `RequireBlankSpecial`, `Expect RequireBlankSpecial`);
    assert.strictEqual(errors[1].range.start.line, 8, `Index of 8 expected`);
    assert.strictEqual(errors[1].offset.position, 17, `Index of 17 expected`);
    assert.strictEqual(errors[1].offset.length, 19, `Index of 19 expected`);
    assert.strictEqual(errors[1].newValue, `*BLANK`, `Value of *BLANK expected`);
  },

  linter5: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = '';`,
      ``,
      `If MyVariable2 = '';`,
      `  If *on = *on;`,
      `    Myvariable2 = 'Hello world';`,
      `  Endif;`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      IncorrectVariableCase: true
    }, cache);

    assert.strictEqual(errors.length, 2, `Expect length of 2`);
    
    assert.strictEqual(errors[0].type, `IncorrectVariableCase`, `Expect IncorrectVariableCase`);
    assert.strictEqual(errors[0].range.start.line, 6, `Index of 6 expected`);
    assert.strictEqual(errors[0].range.start.character, 0, `Index of 0 expected`);
    assert.strictEqual(errors[0].range.end.line, errors[0].range.start.line, `Should be on same line`);
    assert.strictEqual(errors[0].offset.position, 0, `Index of 0 expected`);
    assert.strictEqual(errors[0].offset.length, 11, `Should be index of 11`);
    assert.strictEqual(errors[0].newValue, `MyVariable2`, `Value of MyVariable2 expected`);

    assert.strictEqual(errors[1].type, `IncorrectVariableCase`, `Expect IncorrectVariableCase`);
    assert.strictEqual(errors[1].range.start.line, 10, `Index of 10 expected`);
    assert.strictEqual(errors[1].range.start.character, 4, `Index of 0 expected`);
    assert.strictEqual(errors[1].range.end.line, errors[1].range.start.line, `Should be on same line`);
    assert.strictEqual(errors[1].offset.position, 0, `Index of 0 expected`);
    assert.strictEqual(errors[1].offset.length, 11, `Should be index of 11`);
    assert.strictEqual(errors[1].newValue, `MyVariable2`, `Value of MyVariable2 expected`);
  },

  linter6: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `MyVariable2 = 'Hello world';`,
      `  Select;`,
      `    When myVariable2 = *blank;`,
      `      MyVariable2 = 'Still blank?';`,
      `    When myVariable2 = 'YOYOYO';`,
      `        MyVariable2 = 'YOYOYO';`,
      `  Endsl;`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      StringLiteralDupe: true
    }, cache);

    assert.strictEqual(errors.length, 2, `Expect length of 2`);

    assert.strictEqual(errors[0].type, `StringLiteralDupe`, `Expect StringLiteralDupe`);
    assert.strictEqual(errors[0].range.start.line, 13, `Index of 13 expected`);
    assert.strictEqual(errors[0].range.start.character, 4, `Index of 4 expected`);
    assert.strictEqual(errors[0].offset.position, 19, `Index of 19 expected`);
    assert.strictEqual(errors[0].offset.length, 27, `Index of 27 expected`);

    assert.strictEqual(errors[1].type, `StringLiteralDupe`, `Expect StringLiteralDupe`);
    assert.strictEqual(errors[1].range.start.line, 14, `Index of 14 expected`);
    assert.strictEqual(errors[1].range.start.character, 8, `Index of 8 expected`);
    assert.strictEqual(errors[1].offset.position, 14, `Index of 19 expected`);
    assert.strictEqual(errors[1].offset.length, 22, `Index of 22 expected`);
  },

  linter6_lf: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Dcl-S Myotherthing char(10);`,
      ``,
      `dsply 'hello friends'`,
      `      + 'hello friends' + ''`,
      `    + myotherthing;`,
      `    `
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      StringLiteralDupe: true,
      IncorrectVariableCase: true
    }, cache);

    assert.strictEqual(errors.length, 3, `Expect length of 3`);

    const line = new vscode.Range(new vscode.Position(4, 0), new vscode.Position(6, 18));

    assert.deepStrictEqual(errors[0], {
      range: line,
      offset: { position: 57, length: 69 },
      type: `IncorrectVariableCase`,
      newValue: `Myotherthing`,
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[1], {
      range: line,
      offset: { position: 6, length: 21 },
      type: `StringLiteralDupe`,
      newValue: undefined,
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[2], {
      range: line,
      offset: { position: 30, length: 45 },
      type: `StringLiteralDupe`,
      newValue: undefined,
    }, `Error not as expected`);
  },

  linter6_crlf: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Dcl-S Myotherthing char(10);`,
      ``,
      `dsply 'hello friends'`,
      `      + 'hello friends' + ''`,
      `    + myotherthing;`,
      `    `
    ].join(`\r\n`);

    //const lines = `**FREE\r\n\r\nDcl-S Myotherthing char(10);\r\n\r\ndsply 'hello friends'\r\n      + 'hello friends' + ''\r\n    + myotherthing;`;

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      StringLiteralDupe: true,
      IncorrectVariableCase: true
    }, cache);

    assert.strictEqual(errors.length, 3, `Expect length of 3`);

    const line = new vscode.Range(new vscode.Position(4, 0), new vscode.Position(6, 18));

    assert.deepStrictEqual(errors[0], {
      range: line,
      offset: { position: 59, length: 71 },
      type: `IncorrectVariableCase`,
      newValue: `Myotherthing`,
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[1], {
      range: line,
      offset: { position: 6, length: 21 },
      type: `StringLiteralDupe`, 
      newValue: undefined,
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[2], {
      range: line,
      offset: { position: 31, length: 46 },
      type: `StringLiteralDupe`,
      newValue: undefined,
    }, `Error not as expected`);
  },

  linter7: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `MyVariable2 = 'Hello world';`,
      `  Select;`,
      `    When myVariable2 = *blank;`,
      `      MyVariable2 = 'Still blank?';`,
      `    When myVariable2 = 'YOYOYO';`,
      `        MyVariable2 = 'YOYOYO';`,
      `  Endsl;`,
      `Endif;`,
      `Return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      SpecificCasing: [
        { operation: `if`, expected: `If` },
        { operation: `endif`, expected: `Endif` },
        { operation: `select`, expected: `SELECT` },
      ]
    }, cache);

    assert.strictEqual(errors.length, 1, `Expect length of 1`);

    assert.deepStrictEqual(errors[0], {
      range: new vscode.Range(
        new vscode.Position(10, 2),
        new vscode.Position(10, 8),
      ),
      offset: { position: 0, length: 6 },
      type: `SpecificCasing`,
      newValue: `SELECT`
    }, `Error not as expected`);
  },

  linter8: async () => {
    const lines = [
      `**FREE`,
      `ctl-opt debug nomain option(*nodebugio: *srcstmt) ;`,
      `dcl-proc BASE36ADD export ;`,
      `  dcl-pi BASE36ADD varchar(50);`,
      `    PI_Value varchar(50) const; // Input value`,
      `  end-pi BASE36ADD;`,
      `  dcl-s a char(1);`,
      `  if a ='/';`,
      `    a=' ';`,
      `    a= BASE36ADD;`,
      `  endif;`,
      `  return a;`,
      `end-proc BASE36ADD;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      RequiresParameter: true
    }, cache);

    assert.strictEqual(errors.length, 1, `Expect length of 1`);
    assert.deepStrictEqual(errors[0], {
      range: new vscode.Range(
        new vscode.Position(9, 4),
        new vscode.Position(9, 16),
      ),
      offset: { position: 3, length: 12 },
      type: `RequiresParameter`,
    }, `Error not as expected`);
  },

  /**
   * Check that local variables are not in global scope
   */
  linter9: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Dcl-C theConstant 'Hello world';`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `  Dcl-S localVar Char(20);`,
      `  localvar = newValue;`,
      `  Myvariable2 = localvar;`,
      `End-Proc;`,
    ].join(`\n`);
  
    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      IncorrectVariableCase: true
    }, cache);
  
    assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.constants.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);
    assert.strictEqual(cache.procedures[0].subItems.length, 1, `Expect length of 1`);

    assert.strictEqual(errors.length, 3, `Expect length of 3`);

    assert.deepStrictEqual(errors[0], {
      range: new vscode.Range(
        new vscode.Position(13, 2),
        new vscode.Position(13, 21),
      ),
      offset: { position: 0, length: 8 },
      type: `IncorrectVariableCase`,
      newValue: `localVar`
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[1], {
      range: new vscode.Range(
        new vscode.Position(14, 2),
        new vscode.Position(14, 24),
      ),
      offset: { position: 0, length: 11 },
      type: `IncorrectVariableCase`,
      newValue: `MyVariable2`
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[2], {
      range: new vscode.Range(
        new vscode.Position(14, 2),
        new vscode.Position(14, 24),
      ),
      offset: { position: 14, length: 22 },
      type: `IncorrectVariableCase`,
      newValue: `localVar`
    }, `Error not as expected`);
  },

  linter10: async () => {
    const lines = [
      `**FREE`,
      `ctl-opt debug option(*nodebugio: *srcstmt);`,
      `dcl-ds mything DIM(8) PERRCD(3) CTDATA;`,
      `end-ds;`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `myVariable2 = *blank;`,
      ``,
      `If myVariable2 = *blank;`,
      `MyVariable2 = 'Hello world';`,
      `Endif;`,
      `Return;`,
      ``,
      `**CTDATA ARC`,
      `Toronto        12:15:00Winnipeg       13:23:00Calgary        15:44:00`,
      `Sydney         17:24:30Edmonton       21:33:00Saskatoon      08:40:00`,
      `Regina         12:33:00Vancouver      13:20:00`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      NoCTDATA: true
    }, cache);

    assert.strictEqual(errors.length, 2, `Expect length of 2`);

    assert.deepStrictEqual(errors[0], {
      range: new vscode.Range(
        new vscode.Position(2, 0),
        new vscode.Position(2, 38),
      ),
      type: `NoCTDATA`,
    }, `Error not as expected`);

    assert.deepStrictEqual(errors[1], {
      range: new vscode.Range(
        new vscode.Position(14, 0),
        new vscode.Position(14, 12),
      ),
      offset: { position: 0, length: 8 },
      type: `NoCTDATA`,
    }, `Error not as expected`);
  },

  linter11: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Dcl-c HELLO 'hello friends';`,
      `Dcl-S Myotherthing char(10);`,
      ``,
      `dsply 'hello friends'`,
      `      + 'hello friends' + ''`,
      `    + 'oioi';`,
      `    `
    ].join(`\n`);
  
    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      StringLiteralDupe: true
    }, cache);
  
    assert.strictEqual(errors.length, 2, `Expect length of 2`);
  
    const line = new vscode.Range(new vscode.Position(5, 0), new vscode.Position(7, 12));
  
    assert.deepStrictEqual(errors[0], {
      range: line,
      offset: { position: 6, length: 21 },
      type: `StringLiteralDupe`,
      newValue: `HELLO`,
    }, `Error not as expected`);
  
    assert.deepStrictEqual(errors[1], {
      range: line,
      offset: { position: 30, length: 45 },
      type: `StringLiteralDupe`,
      newValue: `HELLO`,
    }, `Error not as expected`);
  },

  linter12: async () => {
    const lines = [
      `**free`,
      `If 2 = 2;`,
      `  localvar = 'Hello' + `,
      `    'World';`,
      `Else;`,
      `  buyralg_setbu_aprordr(buyralg_getbu_aprordr + `,
      `    arrayapr(wkind));  // 10-26-2016`,
      `Endif;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 0, `Expect length of 0`);
  },

  linter13: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `// my constant`,
      `// second line`,
      `Dcl-C theConstant 'Hello world';`,
      `  // comment with bad indent`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `// comment with wrong indent`,
      `  Dcl-S localVar Char(20);`,
      `  localvar = newValue;`,
      `  // but valid indent`,
      `  // with another line`,
      `      // too many spaces`,
      `  Myvariable2 = localvar;`,
      `End-Proc;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 0, `Expect length of 0`);
  },

  linter13_commentIndent: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `// my constant`,
      `// second line`,
      `Dcl-C theConstant 'Hello world';`,
      `  // comment with bad indent`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `// comment with wrong indent`,
      `  Dcl-S localVar Char(20);`,
      `  localvar = newValue;`,
      `  // but valid indent`,
      `  // with another line`,
      `      // too many spaces`,
      `  Myvariable2 = localvar;`,
      `End-Proc;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      PrettyComments: true,
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 3, `Expect length of 3`);

    assert.deepStrictEqual(indentErrors[0], {
      currentIndent: 2,
      expectedIndent: 0,
      line: 9
    });

    assert.deepStrictEqual(indentErrors[1], {
      currentIndent: 0,
      expectedIndent: 2,
      line: 15
    });

    assert.deepStrictEqual(indentErrors[2], {
      currentIndent: 6,
      expectedIndent: 2,
      line: 20
    });
  },

  linter14: async () => {
    const lines = [
      `**FREE`,
      `//--------------------------------------------------------------------------------------------------`,
      `// Append a single quote. This procedure exists to make other code more readable.`,
      `//--------------------------------------------------------------------------------------------------`,
      `DCL-PROC Q;`,
      `  DCL-PI Q VARCHAR(2048);`,
      `    in_str VARCHAR(2048) CONST OPTIONS(*TRIM);`,
      `  END-PI;`,
      `  `,
      `  DCL-C C_QUOTE '''';`,
      `  DCL-S is_abend IND INZ(*OFF);`,
      `  DCL-S return_str LIKE(in_str);`,
      `  `,
      `  return_str = %TRIM(C_QUOTE + in_str + C_QUOTE);`,
      `  RETURN return_str;`,
      `  // End of procedure`,
      `  `,
      `  ON-EXIT is_abend;`,
      `    // Exit handler`,
      `    IF is_abend;`,
      `      return_str = 'This is a string';`,
      `    ENDIF;`,
      `END-PROC Q;`,
      ``,
      `// New procedure`,
      `Dcl-Proc theProcedure;`,
      `  Dcl-Pi *N;`,
      `    newValue Char(20);`,
      `  End-Pi;`,
      `  // comment with right indent`,
      `  Dcl-S localVar Char(20);`,
      `  localvar = newValue;`,
      `  // but valid indent`,
      `  // with another line`,
      `  Myvariable2 = localvar;`,
      `End-Proc;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { indentErrors } = Linter.getErrors(lines, {
      indent: 2
    }, cache);

    assert.strictEqual(indentErrors.length, 0, `Expect length of 0`);
  },

  linter15: async () => {
    const lines = [
      `**FREE`,
      ``,
      `Ctl-Opt DFTACTGRP(*No);`,
      ``,
      `//`,
      `//Append a single quote. This procedure exists to make other code more readable.`,
      `//`,
      ``,
      `// my variable`,
      `Dcl-S MyVariable2 Char(20);`,
      ``,
      `MyVariable2 = 'Hello world';`,
      ``,
      `If 2 = 2;`,
      `  //Change thw value of my variable`,
      `  MyVariable2 = 'Hello friends';`,
      `  //`,
      `Endif;`,
      ``,
      `Dsply MyVariable2;`,
      ``,
      `return;`
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      PrettyComments: true
    }, cache);

    assert.strictEqual(errors.length, 5, `Expect length of 5`);

    assert.deepStrictEqual(errors[0], {
      type: `PrettyComments`,
      newValue: ``,
      range: new vscode.Range(
        new vscode.Position(4, 0),
        new vscode.Position(4, 2),
      )
    });

    assert.deepStrictEqual(errors[1], {
      type: `PrettyComments`,
      newValue: `// `,
      range: new vscode.Range(
        new vscode.Position(5, 0),
        new vscode.Position(5, 2),
      )
    });

    assert.deepStrictEqual(errors[2], {
      type: `PrettyComments`,
      newValue: ``,
      range: new vscode.Range(
        new vscode.Position(6, 0),
        new vscode.Position(6, 2),
      )
    });

    assert.deepStrictEqual(errors[3], {
      type: `PrettyComments`,
      newValue: `// `,
      range: new vscode.Range(
        new vscode.Position(14, 2),
        new vscode.Position(14, 4),
      )
    });

    assert.deepStrictEqual(errors[4], {
      type: `PrettyComments`,
      newValue: ``,
      range: new vscode.Range(
        new vscode.Position(16, 2),
        new vscode.Position(16, 4),
      )
    });
  },

  /**
   * Subroutine check test
   * */
  linter16: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `Exsr theSubroutine;`,
      `Dsply MyVariable2;`,
      ``,
      `Begsr theSubroutine;`,
      `  MyVariable2 = 'Hello world';`,
      `Endsr;`,
    ].join(`\n`);

    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      NoGlobalSubroutines: true
    }, cache);

    assert.strictEqual(errors.length, 3, `Expect length of 3`);

    assert.deepStrictEqual(errors[0], {
      type: `NoGlobalSubroutines`,
      newValue: `theSubroutine()`,
      range: new vscode.Range(
        new vscode.Position(3, 0),
        new vscode.Position(3, 18),
      )
    });

    assert.deepStrictEqual(errors[1], {
      type: `NoGlobalSubroutines`,
      newValue: `Dcl-Proc`,
      range: new vscode.Range(
        new vscode.Position(6, 0),
        new vscode.Position(6, 19),
      ),
      offset: {
        position: 0,
        length: 5
      }
    });

    assert.deepStrictEqual(errors[2], {
      type: `NoGlobalSubroutines`,
      newValue: `End-Proc`,
      range: new vscode.Range(
        new vscode.Position(8, 0),
        new vscode.Position(8, 5),
      ),
      offset: {
        position: 0,
        length: 5
      }
    });
  },
  
  /**
   * Subroutine in procedure check test
   * */
  linter17: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `theProcedure();`,
      `Dsply MyVariable2;`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Exsr theSubroutine;`,
      `  Begsr theSubroutine;`,
      `    MyVariable2 = 'Hello world';`,
      `  Endsr;`,
      `End-Proc;`,
    ].join(`\n`);
  
    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      NoLocalSubroutines: true
    }, cache);
  
    assert.strictEqual(errors.length, 1, `Expect length of 1`);
  
    assert.deepStrictEqual(errors[0], {
      type: `NoLocalSubroutines`,
      range: new vscode.Range(
        new vscode.Position(8, 2),
        new vscode.Position(8, 21),
      )
    });
  },

  linter18: async () => {
    const lines = [
      `**FREE`,
      `Dcl-s MyVariable2 Char(20);`,
      ``,
      `theProcedure();`,
      `Dsply MyVariable2;`,
      ``,
      `Dcl-Proc theProcedure;`,
      `  Dcl-S mylocal char(20);`,
      `  MyVariable2 = 'Hello world';`,
      `  mylocal = Myvariable2;`,
      `End-Proc;`,
    ].join(`\n`);
  
    const parser = new Parser();
    const cache = await parser.getDocs(URI, lines);
    const { errors } = Linter.getErrors(lines, {
      NoGlobalsInProcedures: true
    }, cache);
  
    assert.strictEqual(errors.length, 2, `Expect length of 2`);

    assert.deepStrictEqual(errors[0], {
      type: `NoGlobalsInProcedures`,
      range: new vscode.Range(
        new vscode.Position(8, 2),
        new vscode.Position(8, 29),
      ),
      offset: {
        position: 0,
        length: 11
      }
    });

    assert.deepStrictEqual(errors[1], {
      type: `NoGlobalsInProcedures`,
      range: new vscode.Range(
        new vscode.Position(9, 2),
        new vscode.Position(9, 23),
      ),
      offset: {
        position: 10,
        length: 21
      }
    });
  }
}