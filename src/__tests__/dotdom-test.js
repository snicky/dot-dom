require('../dotdom');
const dd = window;

const EXPOSED_FULL_TAGS = [
  'a', 'b', 'button', 'i', 'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'table',
  'tr', 'td', 'th', 'ul', 'ol', 'li', 'form', 'label', 'select', 'option'
];

const EXPOSED_SHORT_TAGS = [
  'img', 'input'
];

describe('.dom', function () {

  describe('Functionality', function () {
    describe('DOM Manipulation', function () {

      it('should render simple DOM', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('div');

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div></div>'
        );
      });

      it('should render 1-level nested DOM', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('div', dd.H('a'), dd.H('b'));

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div><a></a><b></b></div>'
        );
      });

      it('should render 2-level nested DOM', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('div',
          dd.H('a', dd.H('ul')),
          dd.H('b', dd.H('ol'))
        );

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div><a><ul></ul></a><b><ol></ol></b></div>'
        );
      });

      it('should render text children', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('div', 'foo');

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div>foo</div>'
        );
      });

      it('should render combined dom and text nodes', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('div', dd.H('a'), 'foo', dd.H('b'));

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div><a></a>foo<b></b></div>'
        );
      });

      it('should apply style properties', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('div', {style: {color: 'red'}});

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div style="color: red;"></div>'
        );
      });

      it('should apply element attributes', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('a', {href: '/'});

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<a href="/"></a>'
        );
      });

      it('should apply event handlers', function () {
        const dom = document.createElement('div');
        const callback = jest.fn();
        const vdom = dd.H('a', {href: '/', onclick:callback});

        dd.R(vdom, dom);

        expect(dom.innerHTML).toEqual(
          '<a href="/"></a>'
        );

        const event = new window.MouseEvent('click');
        dom.firstChild.dispatchEvent(event);

        expect(callback).toBeCalled();
      });

      it('should accept props and children', function () {
        const dom = document.createElement('div');
        const vdom = dd.H('a', {href: '/'}, 'test');

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<a href="/">test</a>'
        );
      });

    })
    describe('Components', function () {
      it('should render simple component', function () {
        const dom = document.createElement('div');
        const Component = function() {
          return dd.H('div')
        }
        const vdom = dd.H(Component);

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div></div>'
        );
      });

      it('should render nested components', function () {
        const dom = document.createElement('div');
        const Component = function() {
          return dd.H('div')
        }
        const HostComponent = function() {
          return dd.H('div',
            H(Component),
            H(Component)
          )
        }
        const vdom = dd.H(HostComponent);

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div><div></div><div></div></div>'
        );
      });

      it('should render component with props', function () {
        const dom = document.createElement('div');
        const Component = function(props) {
          return dd.H('a', {href: props.href})
        }
        const vdom = dd.H(Component, {href: '/'});

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<a href="/"></a>'
        );
      });

      it('should render stateful components', function () {
        const dom = document.createElement('div');
        const Component = function(props, {href='/'}) {
          return dd.H('a', {
            href: href
          })
        }
        const vdom = dd.H(Component, {href: '/'});

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<a href="/"></a>'
        );
      });

      it('should update stateful components', function () {
        const dom = document.createElement('div');
        const Component = function(props, {clicks=0}, setState) {
          return dd.H('button', {
            onclick() {
              setState({
                clicks: clicks + 1
              })
            }
          }, `${clicks} clicks`)
        }
        const vdom = dd.H(Component);

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<button>0 clicks</button>'
        );

        const event = new window.MouseEvent('click');

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button>1 clicks</button>'
        );

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button>2 clicks</button>'
        );
      });

      it('should update independently parallel stateful components', function () {
        const dom = document.createElement('div');
        const Component = function(props, {clicks=0}, setState) {
          return dd.H('button', {
            onclick() {
              setState({
                clicks: clicks + 1
              })
            }
          }, `${clicks} clicks`)
        }
        const vdom = dd.H('div',
          H(Component),
          H(Component)
        );

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div><button>0 clicks</button><button>0 clicks</button></div>'
        );

        const event = new window.MouseEvent('click');

        dom.firstChild.childNodes[0].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<div><button>1 clicks</button><button>0 clicks</button></div>'
        );

        dom.firstChild.childNodes[0].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<div><button>2 clicks</button><button>0 clicks</button></div>'
        );

        dom.firstChild.childNodes[1].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<div><button>2 clicks</button><button>1 clicks</button></div>'
        );

        dom.firstChild.childNodes[1].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<div><button>2 clicks</button><button>2 clicks</button></div>'
        );

        dom.firstChild.childNodes[0].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<div><button>3 clicks</button><button>2 clicks</button></div>'
        );
      });

      it('should maintain state of child components', function () {
        const dom = document.createElement('div');
        const Component = function(props, {clicks=0}, setState) {
          return dd.H('button', {
            onclick() {
              setState({
                clicks: clicks + 1
              })
            }
          }, `${clicks} clicks`)
        }
        const HostComponent = function(props, {clicks=0}, setState) {
          return dd.H('button',
            {
              onclick() {
                setState({
                  clicks: clicks + 1
                })
              }
            },
            dd.H('div', `${clicks} clicks`),
            dd.H(Component),
            dd.H(Component)
          )
        }
        const vdom = dd.H(HostComponent);

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<button><div>0 clicks</div><button>0 clicks</button><button>0 clicks</button></button>'
        );

        const event = new window.MouseEvent('click');

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button>0 clicks</button><button>0 clicks</button></button>'
        );

        dom.firstChild.childNodes[1].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button>1 clicks</button><button>0 clicks</button></button>'
        );

        dom.firstChild.childNodes[1].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button>2 clicks</button><button>0 clicks</button></button>'
        );

        dom.firstChild.childNodes[2].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button>2 clicks</button><button>1 clicks</button></button>'
        );

        dom.firstChild.childNodes[2].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button>2 clicks</button><button>2 clicks</button></button>'
        );

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>2 clicks</div><button>2 clicks</button><button>2 clicks</button></button>'
        );
      });

      it('should discard child state when it\'s type change', function () {
        const dom = document.createElement('div');
        const ComponentA = function(props, {clicks=0}, setState) {
          return dd.H('button', {
            title: 'a',
            onclick() {
              setState({
                clicks: clicks + 1
              })
            }
          }, `${clicks} clicks`)
        }
        const ComponentB = function(props, {clicks=0}, setState) {
          return dd.H('button', {
            title: 'b',
            onclick() {
              setState({
                clicks: clicks + 1
              })
            }
          }, `${clicks} clicks`)
        }
        const HostComponent = function(props, {clicks=0}, setState) {
          const children = [];
          if (clicks % 2) {
            children.push(dd.H(ComponentA));
            children.push(dd.H(ComponentB));
          } else {
            children.push(dd.H(ComponentB));
            children.push(dd.H(ComponentA));
          }

          return dd.H('button',
            {
              onclick() {
                setState({
                  clicks: clicks + 1
                })
              }
            },
            dd.H('div', `${clicks} clicks`),
            ...children
          )
        }
        const vdom = dd.H(HostComponent);

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<button><div>0 clicks</div><button title="b">0 clicks</button><button title="a">0 clicks</button></button>'
        );

        const event = new window.MouseEvent('click');

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button title="a">0 clicks</button><button title="b">0 clicks</button></button>'
        );

        dom.firstChild.childNodes[1].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button title="a">1 clicks</button><button title="b">0 clicks</button></button>'
        );

        dom.firstChild.childNodes[2].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>1 clicks</div><button title="a">1 clicks</button><button title="b">1 clicks</button></button>'
        );

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>2 clicks</div><button title="b">0 clicks</button><button title="a">0 clicks</button></button>'
        );

        dom.firstChild.childNodes[1].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>2 clicks</div><button title="b">1 clicks</button><button title="a">0 clicks</button></button>'
        );

        dom.firstChild.childNodes[2].dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>2 clicks</div><button title="b">1 clicks</button><button title="a">1 clicks</button></button>'
        );

        dom.firstChild.dispatchEvent(event);
        expect(dom.innerHTML).toEqual(
          '<button><div>3 clicks</div><button title="a">0 clicks</button><button title="b">0 clicks</button></button>'
        );
      });

    });

    describe('Tag Shorthands', function () {
      EXPOSED_FULL_TAGS.forEach((tag) => {
        it(`should expose tag '${tag}'`, function () {
          const dom = document.createElement('div');
          const vdom = dd[tag]();

          dd.R(vdom, dom)

          expect(dom.innerHTML).toEqual(
            `<${tag}></${tag}>`
          );
        });
      })

      EXPOSED_SHORT_TAGS.forEach((tag) => {
        it(`should expose tag '${tag}'`, function () {
          const dom = document.createElement('div');
          const vdom = dd[tag]();

          dd.R(vdom, dom)

          expect(dom.innerHTML).toEqual(
            `<${tag}>`
          );
        });
      })

      it('should expand className shorthands', function () {
        const dom = document.createElement('div');
        const vdom = dd.div.class1();

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div class=" class1"></div>'
        );
      })

      it('should expand multiple className shorthands', function () {
        const dom = document.createElement('div');
        const vdom = dd.div.class1.class2.class3();

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div class=" class1 class2 class3"></div>'
        );
      })

      it('should append className shorthands on className props', function () {
        const dom = document.createElement('div');
        const vdom = dd.div.class1.class2.class3({className: 'foo'});

        dd.R(vdom, dom)

        expect(dom.innerHTML).toEqual(
          '<div class="foo class1 class2 class3"></div>'
        );
      })
    });
  });

});
