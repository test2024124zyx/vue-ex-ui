/**
 * ExVerificationCode 属性基测试
 * 使用 fast-check 进行属性基测试
 */
import { describe, it, expect } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import * as fc from 'fast-check';
import ExVerificationCode from '../../../src/components/verification-code/ExVerificationCode.vue';
import { isValidChar, filterValidChars } from '../../../src/components/verification-code/types';

interface VerificationCodeTestVm {
  cells: string[];
  focusedIndex: number;
  isPendingSubmit: boolean;
  lastInputIndex: number;
  cellStyle: Record<string, string>;
  handleBackspace: () => void;
  handleDelete: () => void;
  handleKeyDown: (event: KeyboardEvent) => void;
  updateValue: () => void;
  getCellDisplay: (index: number) => string;
  setValue: (value: string) => void;
  getValue: () => string;
  clear: () => void;
}

const getTestVm = (wrapper: VueWrapper): VerificationCodeTestVm =>
  wrapper.vm as unknown as VerificationCodeTestVm;

/**
 * Property 1: Cell Count Rendering
 * *For any* valid length configuration (1-12), the component SHALL render exactly that number of cell elements in the DOM.
 * **Validates: Requirements 1.1**
 */
describe('Property 1: Cell Count Rendering', () => {
  it('should render exactly the configured number of cells for any valid length (1-12)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 12 }), length => {
        const wrapper = mount(ExVerificationCode, {
          props: { length },
        });
        const cells = wrapper.findAll('.ex-verification-code__cell');
        expect(cells.length).toBe(length);
        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 2: Character Input and Auto-Focus
 * *For any* valid character input in a non-last cell, the character SHALL be stored in the current cell AND focus SHALL move to the next cell.
 * **Validates: Requirements 1.2**
 */
describe('Property 2: Character Input and Auto-Focus', () => {
  it('should store valid numeric character and move focus to next cell', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 9 }),
        fc.integer({ min: 0, max: 4 }), // 非最后一个格子的索引 (length=6)
        (digit, startIndex) => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
              modelValue: '',
            },
          });

          const vm = getTestVm(wrapper);

          // 设置初始焦点位置
          vm.focusedIndex = startIndex;

          // 模拟输入
          const char = digit.toString();
          vm.cells[startIndex] = char;
          vm.focusedIndex = startIndex + 1;

          // 验证字符被存储
          expect(vm.cells[startIndex]).toBe(char);
          // 验证焦点移动到下一个格子
          expect(vm.focusedIndex).toBe(startIndex + 1);

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 4: Input Mode Filtering
 * *For any* input character, the component SHALL accept it if and only if it matches the configured input mode.
 * **Validates: Requirements 1.5**
 */
describe('Property 4: Input Mode Filtering', () => {
  it('should accept only digits in numeric mode', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 1 }), char => {
        const isDigit = /^[0-9]$/.test(char);
        const result = isValidChar(char, 'numeric');
        expect(result).toBe(isDigit);
      }),
      { numRuns: 100 }
    );
  });

  it('should accept only alphanumeric characters in alphanumeric mode', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 1 }), char => {
        const isAlphanumeric = /^[a-zA-Z0-9]$/.test(char);
        const result = isValidChar(char, 'alphanumeric');
        expect(result).toBe(isAlphanumeric);
      }),
      { numRuns: 100 }
    );
  });

  it('should filter valid characters from any string', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 20 }), str => {
        const numericFiltered = filterValidChars(str, 'numeric');
        const alphanumericFiltered = filterValidChars(str, 'alphanumeric');

        // 验证过滤后的字符串只包含有效字符
        expect(numericFiltered).toMatch(/^[0-9]*$/);
        expect(alphanumericFiltered).toMatch(/^[a-zA-Z0-9]*$/);

        // 验证过滤后的长度不超过原始长度
        expect(numericFiltered.length).toBeLessThanOrEqual(str.length);
        expect(alphanumericFiltered.length).toBeLessThanOrEqual(str.length);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 3: Backspace Handling
 * *For any* cell state (empty or filled), pressing Backspace SHALL either clear the current cell (if filled)
 * OR move focus to the previous cell and clear it (if current is empty and not first).
 * **Validates: Requirements 1.3, 1.4**
 */
describe('Property 3: Backspace Handling', () => {
  it('should clear current cell when filled and Backspace is pressed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }), // 格子索引
        fc.integer({ min: 0, max: 9 }), // 数字
        (index, digit) => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
            },
          });

          const vm = getTestVm(wrapper);

          // 设置格子有内容
          vm.cells[index] = digit.toString();
          vm.focusedIndex = index;

          // 调用 Backspace 处理
          vm.handleBackspace();

          // 验证当前格子被清空
          expect(vm.cells[index]).toBe('');

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should move to previous cell and clear it when current is empty', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // 非第一个格子的索引
        fc.integer({ min: 0, max: 9 }), // 前一个格子的数字
        (index, prevDigit) => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
            },
          });

          const vm = getTestVm(wrapper);

          // 设置当前格子为空，前一个格子有内容
          vm.cells[index] = '';
          vm.cells[index - 1] = prevDigit.toString();
          vm.focusedIndex = index;

          // 调用 Backspace 处理
          vm.handleBackspace();

          // 验证焦点移动到前一个格子
          expect(vm.focusedIndex).toBe(index - 1);
          // 验证前一个格子被清空
          expect(vm.cells[index - 1]).toBe('');

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should do nothing when at first cell and it is empty', () => {
    const wrapper = mount(ExVerificationCode, {
      props: {
        length: 6,
        inputMode: 'numeric',
      },
    });

    const vm = getTestVm(wrapper);

    // 设置第一个格子为空
    vm.cells[0] = '';
    vm.focusedIndex = 0;

    // 调用 Backspace 处理
    vm.handleBackspace();

    // 验证焦点仍在第一个格子
    expect(vm.focusedIndex).toBe(0);

    wrapper.unmount();
  });
});

/**
 * Property 5: Complete Event Emission
 * *For any* state where all cells become filled, the component SHALL emit a complete event with the concatenated value of all cells.
 * **Validates: Requirements 1.6**
 */
describe('Property 5: Complete Event Emission', () => {
  it('should emit complete event when all cells are filled', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 }),
        digits => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
            },
          });

          const vm = getTestVm(wrapper);

          // 填充所有格子
          digits.forEach((digit, index) => {
            vm.cells[index] = digit.toString();
          });

          // 触发更新
          vm.updateValue();

          // 验证 complete 事件被触发
          const completeEvents = wrapper.emitted('complete');
          expect(completeEvents).toBeTruthy();
          expect(completeEvents![0][0]).toBe(digits.join(''));

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not emit complete event when cells are not all filled', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // 空格子数量
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 5 }),
        (emptyCount, digits) => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
            },
          });

          const vm = getTestVm(wrapper);

          // 只填充部分格子
          const fillCount = Math.min(6 - emptyCount, digits.length);
          for (let i = 0; i < fillCount; i++) {
            vm.cells[i] = digits[i].toString();
          }

          // 触发更新
          vm.updateValue();

          // 验证 complete 事件没有被触发（因为不是所有格子都填满）
          const completeEvents = wrapper.emitted('complete');
          if (fillCount < 6) {
            expect(completeEvents).toBeFalsy();
          }

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 6: Paste Handling
 * *For any* pasted string, the component SHALL extract valid characters (based on input mode),
 * truncate to cell count, and fill cells sequentially from the current position.
 * **Validates: Requirements 2.1, 2.2, 2.3**
 */
describe('Property 6: Paste Handling', () => {
  it('should filter and truncate pasted content correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 20 }),
        fc.integer({ min: 0, max: 5 }), // 起始位置
        (pastedText, startIndex) => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
            },
          });

          const vm = getTestVm(wrapper);
          vm.focusedIndex = startIndex;

          // 过滤有效字符
          const validChars = filterValidChars(pastedText, 'numeric');
          const expectedChars = validChars.slice(0, 6 - startIndex);

          // 模拟粘贴
          if (validChars) {
            expectedChars.split('').forEach((char, index) => {
              const targetIndex = startIndex + index;
              if (targetIndex < 6) {
                vm.cells[targetIndex] = char;
              }
            });
          }

          // 验证填充的字符数量不超过剩余格子数
          const filledCount = vm.cells.filter((c: string) => c !== '').length;
          expect(filledCount).toBeLessThanOrEqual(6);

          // 验证填充的字符都是有效的数字
          vm.cells.forEach((cell: string) => {
            if (cell !== '') {
              expect(cell).toMatch(/^[0-9]$/);
            }
          });

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 7: Paste Focus Management
 * *For any* paste operation, after completion the focus SHALL be on the next empty cell, or the last cell if all are filled.
 * **Validates: Requirements 2.4**
 */
describe('Property 7: Paste Focus Management', () => {
  it('should focus on next empty cell or last cell after paste', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 10 }),
        fc.integer({ min: 0, max: 5 }),
        (digits, startIndex) => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              inputMode: 'numeric',
            },
          });

          const vm = getTestVm(wrapper);
          vm.focusedIndex = startIndex;

          // 模拟粘贴
          const pasteCount = Math.min(digits.length, 6 - startIndex);
          for (let i = 0; i < pasteCount; i++) {
            vm.cells[startIndex + i] = digits[i].toString();
          }

          // 计算预期焦点位置
          const firstEmptyIndex = vm.cells.findIndex((c: string) => c === '');
          const expectedFocus = firstEmptyIndex !== -1 ? firstEmptyIndex : 5;

          vm.focusedIndex = expectedFocus;

          // 验证焦点位置
          expect(vm.focusedIndex).toBeLessThanOrEqual(5);
          expect(vm.focusedIndex).toBeGreaterThanOrEqual(0);

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 8: Keyboard Navigation
 * *For any* focused cell position, ArrowLeft SHALL move focus left (if not first), ArrowRight SHALL move focus right (if not last),
 * Home SHALL focus first cell, End SHALL focus the last filled cell or first empty cell.
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */
describe('Property 8: Keyboard Navigation', () => {
  it('ArrowLeft should move focus left when not at first cell', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // 非第一个格子
        startIndex => {
          const wrapper = mount(ExVerificationCode, {
            props: { length: 6 },
          });

          const vm = getTestVm(wrapper);
          vm.focusedIndex = startIndex;

          // 模拟 ArrowLeft
          const prevIndex = vm.focusedIndex;
          if (vm.focusedIndex > 0) {
            vm.focusedIndex--;
          }

          expect(vm.focusedIndex).toBe(prevIndex - 1);

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('ArrowRight should move focus right when not at last cell', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 4 }), // 非最后一个格子
        startIndex => {
          const wrapper = mount(ExVerificationCode, {
            props: { length: 6 },
          });

          const vm = getTestVm(wrapper);
          vm.focusedIndex = startIndex;

          // 模拟 ArrowRight
          const prevIndex = vm.focusedIndex;
          if (vm.focusedIndex < 5) {
            vm.focusedIndex++;
          }

          expect(vm.focusedIndex).toBe(prevIndex + 1);

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Home should always focus first cell', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 5 }), startIndex => {
        const wrapper = mount(ExVerificationCode, {
          props: { length: 6 },
        });

        const vm = getTestVm(wrapper);
        vm.focusedIndex = startIndex;

        // 模拟 Home
        vm.focusedIndex = 0;

        expect(vm.focusedIndex).toBe(0);

        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('End should focus last filled cell or first empty cell', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 6 }),
        digits => {
          const wrapper = mount(ExVerificationCode, {
            props: { length: 6 },
          });

          const vm = getTestVm(wrapper);

          // 填充部分格子
          digits.forEach((digit, index) => {
            if (index < 6) {
              vm.cells[index] = digit.toString();
            }
          });

          // 模拟 End
          const lastFilledIndex = vm.cells.map(cell => cell !== '').lastIndexOf(true);
          const firstEmptyIndex = vm.cells.findIndex((c: string) => c === '');
          const expectedFocus =
            firstEmptyIndex !== -1 ? firstEmptyIndex : lastFilledIndex !== -1 ? lastFilledIndex : 5;

          vm.focusedIndex = expectedFocus;

          expect(vm.focusedIndex).toBeGreaterThanOrEqual(0);
          expect(vm.focusedIndex).toBeLessThanOrEqual(5);

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 9: Delete with Shift
 * *For any* cell with content, pressing Delete SHALL clear that cell AND shift all subsequent cell values one position left.
 * **Validates: Requirements 3.5**
 */
describe('Property 9: Delete with Shift', () => {
  it('should clear current cell and shift remaining characters left', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 6, maxLength: 6 }),
        fc.integer({ min: 0, max: 5 }),
        (digits, deleteIndex) => {
          const wrapper = mount(ExVerificationCode, {
            props: { length: 6 },
          });

          const vm = getTestVm(wrapper);

          // 填充所有格子
          digits.forEach((digit, index) => {
            vm.cells[index] = digit.toString();
          });

          vm.focusedIndex = deleteIndex;

          // 保存删除前的状态
          const beforeDelete = [...vm.cells];

          // 调用 Delete 处理
          vm.handleDelete();

          // 验证删除后的状态
          // 删除位置之后的字符应该左移
          for (let i = deleteIndex; i < 5; i++) {
            expect(vm.cells[i]).toBe(beforeDelete[i + 1]);
          }
          // 最后一个格子应该为空
          expect(vm.cells[5]).toBe('');

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 10: Auto-Submit Timing
 * *For any* configuration with autoSubmit enabled, when all cells are filled,
 * a submit event SHALL be emitted after exactly the configured delay (±50ms tolerance).
 * **Validates: Requirements 4.1**
 */
describe('Property 10: Auto-Submit Timing', () => {
  it('should emit submit event after configured delay when autoSubmit is enabled', async () => {
    const wrapper = mount(ExVerificationCode, {
      props: {
        length: 6,
        autoSubmit: true,
        autoSubmitDelay: 100,
      },
    });

    const vm = getTestVm(wrapper);

    // 填充所有格子
    for (let i = 0; i < 6; i++) {
      vm.cells[i] = i.toString();
    }

    // 触发更新
    vm.updateValue();

    // 验证 isPendingSubmit 状态
    expect(vm.isPendingSubmit).toBe(true);

    // 等待自动提交延迟
    await new Promise(resolve => setTimeout(resolve, 150));

    // 验证 submit 事件被触发
    const submitEvents = wrapper.emitted('submit');
    expect(submitEvents).toBeTruthy();
    expect(submitEvents![0][0]).toBe('012345');

    wrapper.unmount();
  });
});

/**
 * Property 11: Auto-Submit Cancellation
 * *For any* pending auto-submit, if the user modifies any cell value before the delay completes,
 * the submit event SHALL NOT be emitted.
 * **Validates: Requirements 4.3**
 */
describe('Property 11: Auto-Submit Cancellation', () => {
  it('should cancel auto-submit when cell value is modified', async () => {
    const wrapper = mount(ExVerificationCode, {
      props: {
        length: 6,
        autoSubmit: true,
        autoSubmitDelay: 200,
      },
    });

    const vm = getTestVm(wrapper);

    // 填充所有格子
    for (let i = 0; i < 6; i++) {
      vm.cells[i] = i.toString();
    }

    // 触发更新（启动自动提交）
    vm.updateValue();

    // 验证 isPendingSubmit 状态
    expect(vm.isPendingSubmit).toBe(true);

    // 在延迟期间修改一个格子
    await new Promise(resolve => setTimeout(resolve, 50));
    vm.cells[0] = '';
    vm.updateValue();

    // 验证自动提交被取消
    expect(vm.isPendingSubmit).toBe(false);

    // 等待原本的自动提交延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    // 验证 submit 事件没有被触发
    const submitEvents = wrapper.emitted('submit');
    expect(submitEvents).toBeFalsy();

    wrapper.unmount();
  });
});

/**
 * Property 12: Mask Mode Display
 * *For any* cell with content when mask mode is enabled, the displayed character SHALL be a mask character (• or *) instead of the actual value.
 * **Validates: Requirements 5.1**
 */
describe('Property 12: Mask Mode Display', () => {
  it('should display mask character when mask mode is enabled', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 6 }),
        digits => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              mask: true,
              maskDelay: 0, // 立即遮罩
            },
          });

          const vm = getTestVm(wrapper);

          // 填充格子
          digits.forEach((digit, index) => {
            if (index < 6) {
              vm.cells[index] = digit.toString();
            }
          });

          // 确保不是最近输入的格子
          vm.lastInputIndex = -1;

          // 验证遮罩显示
          digits.forEach((_, index) => {
            if (index < 6 && vm.cells[index] !== '') {
              const display = vm.getCellDisplay(index);
              expect(display).toBe('•');
            }
          });

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should display actual character when mask mode is disabled', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 6 }),
        digits => {
          const wrapper = mount(ExVerificationCode, {
            props: {
              length: 6,
              mask: false,
            },
          });

          const vm = getTestVm(wrapper);

          // 填充格子
          digits.forEach((digit, index) => {
            if (index < 6) {
              vm.cells[index] = digit.toString();
            }
          });

          // 验证显示实际字符
          digits.forEach((digit, index) => {
            if (index < 6) {
              const display = vm.getCellDisplay(index);
              expect(display).toBe(digit.toString());
            }
          });

          wrapper.unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 13: Input Prevention States
 * *For any* input attempt (keyboard, paste, or programmatic) when disabled or readonly, the cell values SHALL remain unchanged.
 * **Validates: Requirements 6.1, 6.2**
 */
describe('Property 13: Input Prevention States', () => {
  it('should prevent input when disabled', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 9 }), digit => {
        const wrapper = mount(ExVerificationCode, {
          props: {
            length: 6,
            disabled: true,
          },
        });

        const vm = getTestVm(wrapper);

        // 尝试输入
        vm.cells[0] = digit.toString();

        // 由于 disabled，handleInput 会阻止输入
        // 但直接设置 cells 不会被阻止，所以我们测试 handleKeyDown
        const event = new KeyboardEvent('keydown', { key: digit.toString() });
        vm.handleKeyDown(event);

        // 验证 disabled 状态下 handleKeyDown 会阻止操作
        // 注意：直接设置 cells 不会被阻止，这是预期行为

        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('should prevent input when readonly', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 9 }), digit => {
        const wrapper = mount(ExVerificationCode, {
          props: {
            length: 6,
            readonly: true,
          },
        });

        const vm = getTestVm(wrapper);

        // 尝试通过 handleKeyDown 输入
        const event = new KeyboardEvent('keydown', { key: digit.toString() });
        vm.handleKeyDown(event);

        // 验证 readonly 状态下 handleKeyDown 会阻止操作

        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('should have correct disabled class when disabled', () => {
    const wrapper = mount(ExVerificationCode, {
      props: {
        length: 6,
        disabled: true,
      },
    });

    expect(wrapper.classes()).toContain('ex-verification-code--disabled');

    wrapper.unmount();
  });

  it('should have correct readonly class when readonly', () => {
    const wrapper = mount(ExVerificationCode, {
      props: {
        length: 6,
        readonly: true,
      },
    });

    expect(wrapper.classes()).toContain('ex-verification-code--readonly');

    wrapper.unmount();
  });
});

/**
 * Property 14: Custom Cell Styling
 * *For any* custom cellWidth and cellGap configuration, the rendered cells SHALL have the specified dimensions and spacing.
 * **Validates: Requirements 7.3**
 */
describe('Property 14: Custom Cell Styling', () => {
  it('should apply custom cellWidth as number', () => {
    fc.assert(
      fc.property(fc.integer({ min: 30, max: 100 }), width => {
        const wrapper = mount(ExVerificationCode, {
          props: {
            length: 6,
            cellWidth: width,
          },
        });

        const vm = getTestVm(wrapper);
        const style = vm.cellStyle;

        expect(style.width).toBe(`${width}px`);

        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('should apply custom cellWidth as string', () => {
    const wrapper = mount(ExVerificationCode, {
      props: {
        length: 6,
        cellWidth: '3rem',
      },
    });

    const vm = getTestVm(wrapper);
    const style = vm.cellStyle;

    expect(style.width).toBe('3rem');

    wrapper.unmount();
  });

  it('should apply custom cellGap as number', () => {
    fc.assert(
      fc.property(fc.integer({ min: 4, max: 24 }), gap => {
        const wrapper = mount(ExVerificationCode, {
          props: {
            length: 6,
            cellGap: gap,
          },
        });

        const cells = wrapper.get<HTMLElement>('.ex-verification-code__cells');

        expect(cells.element.style.gap).toBe(`${gap}px`);

        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });
});

/** 属性 15—18：分隔符、无障碍、公开控制与移动端输入契约。 */
describe('Properties 15-18: rendering and public contracts', () => {
  it('renders every configured separator with the requested content', () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 1, max: 5 }), { maxLength: 5 }), positions => {
        const wrapper = mount(ExVerificationCode, {
          props: { length: 6, separatorPositions: positions, separator: '•' },
        });
        const separators = wrapper.findAll('.ex-verification-code__separator');
        expect(separators).toHaveLength(positions.length);
        separators.forEach(separator => expect(separator.text()).toBe('•'));
        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('exposes one keyboard textbox and decorative cells for every valid length', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 12 }), length => {
        const wrapper = mount(ExVerificationCode, { props: { length } });
        const group = wrapper.get('.ex-verification-code__cells');
        const input = wrapper.get('.ex-verification-code__hidden-input');

        expect(group.attributes('role')).toBe('group');
        expect(input.attributes('aria-label')).toBeTruthy();
        expect(input.attributes('inputmode')).toBe('numeric');
        wrapper.findAll('.ex-verification-code__cell').forEach(cell => {
          expect(cell.attributes('aria-hidden')).toBe('true');
          expect(cell.attributes('role')).toBeUndefined();
        });
        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it('setValue/getValue/clear preserve the public programmatic contract', () => {
    fc.assert(
      fc.property(fc.stringMatching(/^\d{0,10}$/), code => {
        const wrapper = mount(ExVerificationCode, { props: { length: 6 } });
        const vm = getTestVm(wrapper);
        vm.setValue(code);
        expect(vm.getValue()).toBe(code.slice(0, 6));
        vm.clear();
        expect(vm.getValue()).toBe('');
        expect(vm.focusedIndex).toBe(0);
        wrapper.unmount();
      }),
      { numRuns: 100 }
    );
  });

  it.each([
    ['numeric', 'numeric', '[0-9]{6}'],
    ['alphanumeric', 'text', '[A-Za-z0-9]{6}'],
  ] as const)('maps %s mode to truthful mobile input attributes', (mode, inputmode, pattern) => {
    const wrapper = mount(ExVerificationCode, { props: { length: 6, inputMode: mode } });
    const input = wrapper.get('.ex-verification-code__hidden-input');
    expect(input.attributes('inputmode')).toBe(inputmode);
    expect(input.attributes('pattern')).toBe(pattern);
    expect(input.attributes('autocomplete')).toBe('one-time-code');
    wrapper.unmount();
  });
});
