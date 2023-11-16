# Configuration

The essential configuration options are `root`, `dev` and `createRenderFunction()`. Following the conventions covered in the previous section, setting those is enough to get most simple apps working well. 

But all steps of the setup can be configured isolatedly. 

Below is a execution flow diagram of all configuration functions:

```
├─ prepareClient()
│  ├─ createHtmlFunction()
│  ├─ createRenderFunction()
│  ├─ createRouteHandler()
│  └─ createErrorHandler()
└─ createRoute()
```
